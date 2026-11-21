<?php
use App\Http\Middleware\StockCoreToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::get('/', function () {
    $index=public_path('stockcore/index.html');
    return file_exists($index) ? response()->file($index) : view('welcome');
});

Route::post('/api/login', function(Request $request) {
    $data=$request->validate(['email'=>['required','email'],'password'=>['required','string']]);
    $user=\App\Models\User::where('email',$data['email'])->first();
    if (!$user || !Hash::check($data['password'],$user->password)) return response()->json(['message'=>'Invalid email or password.'],422);
    $plain=Str::random(64);
    DB::table('stockcore_api_tokens')->insert(['user_id'=>$user->id,'token_hash'=>hash('sha256',$plain),'created_at'=>now(),'updated_at'=>now()]);
    return response()->json(['token'=>$plain,'user'=>['id'=>$user->id,'name'=>$user->name,'email'=>$user->email,'role'=>$user->role ?? 'staff']]);
})->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);

Route::middleware(StockCoreToken::class)->group(function() {
    Route::get('/api/me', function(Request $r) {
        $u=$r->attributes->get('stockcore_user');
        return response()->json(['user'=>['id'=>$u->id,'name'=>$u->name,'email'=>$u->email,'role'=>$u->role ?? 'staff']]);
    });
    Route::post('/api/logout',function(Request $r) {
        DB::table('stockcore_api_tokens')->where('token_hash',hash('sha256',$r->bearerToken()))->delete();
        return response()->json(['message'=>'Signed out.']);
    })->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);

    Route::get('/api/dashboard',function() {
        $p=DB::table('stockcore_products');
        return response()->json([
            'total_products'=>(clone $p)->count(),'total_units'=>(clone $p)->sum('quantity'),
            'low_stock'=>(clone $p)->whereColumn('quantity','<=','reorder_level')->count(),
            'inventory_value'=>(clone $p)->selectRaw('COALESCE(SUM(quantity*unit_price),0) total')->value('total'),
            'recent_transactions'=>DB::table('stockcore_transactions')->join('stockcore_products','stockcore_products.id','=','stockcore_transactions.product_id')
                ->leftJoin('users','users.id','=','stockcore_transactions.user_id')
                ->select('stockcore_transactions.*','stockcore_products.name as product_name','users.name as user_name')
                ->latest('stockcore_transactions.created_at')->limit(6)->get(),
            'low_stock_products'=>(clone $p)->whereColumn('quantity','<=','reorder_level')->orderBy('quantity')->limit(6)->get()
        ]);
    });
    Route::get('/api/products',fn()=>DB::table('stockcore_products')->orderBy('name')->get());
    Route::post('/api/products',function(Request $r) {
        $d=$r->validate(['sku'=>'required|string|max:80|unique:stockcore_products,sku','name'=>'required|string|max:160','category'=>'nullable|string|max:100',
            'unit'=>'nullable|string|max:30','quantity'=>'required|integer|min:0','reorder_level'=>'required|integer|min:0','unit_price'=>'required|numeric|min:0']);
        $id=DB::table('stockcore_products')->insertGetId($d+['created_at'=>now(),'updated_at'=>now()]);
        return response()->json(DB::table('stockcore_products')->find($id),201);
    });
    Route::put('/api/products/{id}',function(Request $r,int $id) {
        if (!DB::table('stockcore_products')->where('id',$id)->exists()) return response()->json(['message'=>'Product not found.'],404);
        $d=$r->validate(['sku'=>'required|string|max:80|unique:stockcore_products,sku,'.$id,'name'=>'required|string|max:160','category'=>'nullable|string|max:100',
            'unit'=>'nullable|string|max:30','quantity'=>'required|integer|min:0','reorder_level'=>'required|integer|min:0','unit_price'=>'required|numeric|min:0']);
        DB::table('stockcore_products')->where('id',$id)->update($d+['updated_at'=>now()]);
        return response()->json(DB::table('stockcore_products')->find($id));
    });
    Route::delete('/api/products/{id}',function(Request $r,int $id) {
        if (($r->attributes->get('stockcore_user')->role ?? 'staff') !== 'admin') {
            return response()->json(['message'=>'Only Admin users can delete products.'],403);
        }
        if (DB::table('stockcore_transactions')->where('product_id',$id)->exists()) {
            return response()->json(['message'=>'This product has transaction history and cannot be deleted.'],409);
        }
        DB::table('stockcore_products')->where('id',$id)->delete(); return response()->json(['message'=>'Product deleted.']);
    });
    Route::get('/api/transactions',fn()=>DB::table('stockcore_transactions')->join('stockcore_products','stockcore_products.id','=','stockcore_transactions.product_id')
        ->leftJoin('users','users.id','=','stockcore_transactions.user_id')
        ->select('stockcore_transactions.*','stockcore_products.name as product_name','stockcore_products.sku','users.name as user_name')
        ->latest('stockcore_transactions.created_at')->limit(100)->get());
    Route::post('/api/transactions',function(Request $r) {
        $d=$r->validate(['product_id'=>'required|integer|exists:stockcore_products,id','type'=>'required|in:stock_in,stock_out',
            'quantity'=>'required|integer|min:1','reference'=>'nullable|string|max:120','notes'=>'nullable|string|max:1000']);
        return DB::transaction(function() use($d,$r) {
            $p=DB::table('stockcore_products')->where('id',$d['product_id'])->lockForUpdate()->first();
            if ($d['type']==='stock_out' && $p->quantity<$d['quantity']) return response()->json(['message'=>'Not enough stock available.'],422);
            $qty=$d['type']==='stock_in' ? $p->quantity+$d['quantity'] : $p->quantity-$d['quantity'];
            DB::table('stockcore_products')->where('id',$p->id)->update(['quantity'=>$qty,'updated_at'=>now()]);
            $id=DB::table('stockcore_transactions')->insertGetId(['product_id'=>$p->id,'user_id'=>$r->attributes->get('stockcore_user')->id,
                'type'=>$d['type'],'quantity'=>$d['quantity'],'reference'=>$d['reference']??null,'notes'=>$d['notes']??null,'created_at'=>now(),'updated_at'=>now()]);
            return response()->json(DB::table('stockcore_transactions')->find($id),201);
        });
    });
});

Route::get('/{any}',function() {
    $index=public_path('stockcore/index.html');
    return file_exists($index) ? response()->file($index) : abort(404);
})->where('any','^(?!api).*$');
