<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo', 180);
            $table->text('conteudo');
            $table->string('imagem_url', 1000)->nullable();
            $table->uuid('id_livro')->nullable();
            $table->uuid('id_usuario');
            $table->timestamps();

            $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('id_livro')->references('id')->on('books')->nullOnDelete();
            $table->index(['id_usuario', 'created_at']);
            $table->index(['id_livro']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
