<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trade_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_trade')->constrained('trades')->cascadeOnDelete();
            $table->foreignUuid('id_remetente')->constrained('users')->cascadeOnDelete();
            $table->text('mensagem');
            $table->timestamps();

            $table->index(['id_trade', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trade_messages');
    }
};
