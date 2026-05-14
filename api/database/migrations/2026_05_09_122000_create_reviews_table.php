<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_trade')->constrained('trades')->cascadeOnDelete();
            $table->foreignUuid('id_avaliador')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('id_avaliado')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('nota');
            $table->text('comentario')->nullable();
            $table->timestamps();

            $table->unique(['id_trade', 'id_avaliador']);
            $table->index(['id_avaliado', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
