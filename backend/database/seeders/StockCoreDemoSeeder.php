<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
class StockCoreDemoSeeder extends Seeder {
    public function run(): void {
        DB::table('users')->updateOrInsert(['email'=>'admin@stockcore.test'],['name'=>'StockCore Admin','password'=>Hash::make('Admin123!'),'role'=>'admin','created_at'=>now(),'updated_at'=>now()]);
        DB::table('users')->updateOrInsert(['email'=>'staff@stockcore.test'],['name'=>'StockCore Staff','password'=>Hash::make('Staff123!'),'role'=>'staff','created_at'=>now(),'updated_at'=>now()]);
        $items=[
            ['sku'=>'SC-1001','name'=>'Premium Mineral Water 5 Gallon','category'=>'Water Supply','unit'=>'container','quantity'=>86,'reorder_level'=>20,'unit_price'=>45],
            ['sku'=>'SC-1002','name'=>'Empty Water Container','category'=>'Containers','unit'=>'pcs','quantity'=>14,'reorder_level'=>15,'unit_price'=>120],
            ['sku'=>'SC-1003','name'=>'Sealing Cap','category'=>'Accessories','unit'=>'pack','quantity'=>42,'reorder_level'=>10,'unit_price'=>35],
            ['sku'=>'SC-1004','name'=>'Water Filter Cartridge','category'=>'Maintenance','unit'=>'pcs','quantity'=>8,'reorder_level'=>12,'unit_price'=>280],
            ['sku'=>'SC-1005','name'=>'Bottle Cleaning Brush','category'=>'Accessories','unit'=>'pcs','quantity'=>31,'reorder_level'=>8,'unit_price'=>65],
            ['sku'=>'SC-1006','name'=>'Shrink Seal Roll','category'=>'Packaging','unit'=>'roll','quantity'=>5,'reorder_level'=>10,'unit_price'=>95],
        ];
        foreach($items as $item) DB::table('stockcore_products')->updateOrInsert(['sku'=>$item['sku']],$item+['created_at'=>now(),'updated_at'=>now()]);
    }
}
