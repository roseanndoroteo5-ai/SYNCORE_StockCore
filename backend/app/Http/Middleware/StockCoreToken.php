<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
class StockCoreToken {
    public function handle(Request $request, Closure $next): Response {
        $plain=$request->bearerToken();
        if (!$plain) return response()->json(['message'=>'Unauthenticated.'],401);
        $token=DB::table('stockcore_api_tokens')->where('token_hash',hash('sha256',$plain))
            ->where(fn($q)=>$q->whereNull('expires_at')->orWhere('expires_at','>',now()))->first();
        $user=$token ? \App\Models\User::find($token->user_id) : null;
        if (!$user) return response()->json(['message'=>'Invalid or expired token.'],401);
        $request->attributes->set('stockcore_user',$user);
        return $next($request);
    }
}
