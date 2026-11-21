<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) $table->string('role')->default('staff')->after('password');
        });
        Schema::create('stockcore_api_tokens', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token_hash',64)->unique(); $table->timestamp('expires_at')->nullable(); $table->timestamps();
        });
        Schema::create('stockcore_products', function (Blueprint $table) {
            $table->id(); $table->string('sku')->unique(); $table->string('name'); $table->string('category')->default('General');
            $table->string('unit')->default('pcs'); $table->unsignedInteger('quantity')->default(0);
            $table->unsignedInteger('reorder_level')->default(10); $table->decimal('unit_price',12,2)->default(0); $table->timestamps();
        });
        Schema::create('stockcore_transactions', function (Blueprint $table) {
            $table->id(); $table->foreignId('product_id')->constrained('stockcore_products');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type',['stock_in','stock_out']); $table->unsignedInteger('quantity');
            $table->string('reference')->nullable(); $table->text('notes')->nullable(); $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('stockcore_transactions'); Schema::dropIfExists('stockcore_products');
        Schema::dropIfExists('stockcore_api_tokens');
        if (Schema::hasColumn('users','role')) Schema::table('users', fn (Blueprint $table) => $table->dropColumn('role'));
    }
};
