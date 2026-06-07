<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_usuario');
            $table->uuid('id_instituicao');
            $table->uuid('id_livro');
            $table->text('observacoes')->nullable();
            $table->string('status', 30)->default('solicitada');
            $table->timestamps();

            $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('id_instituicao')->references('id')->on('institutions')->cascadeOnDelete();
            $table->foreign('id_livro')->references('id')->on('books')->cascadeOnDelete();
            $table->index(['id_usuario', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
