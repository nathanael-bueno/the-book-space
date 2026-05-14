<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_livro_solicitado');
            $table->uuid('id_livro_oferecido');
            $table->uuid('id_usuario_proponente');
            $table->uuid('id_usuario_destinatario');
            $table->string('status', 30)->default('pendente');
            $table->text('mensagem')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('confirmado_proponente_at')->nullable();
            $table->timestamp('confirmado_destinatario_at')->nullable();
            $table->timestamps();

            $table->foreign('id_livro_solicitado')->references('id')->on('books')->cascadeOnDelete();
            $table->foreign('id_livro_oferecido')->references('id')->on('books')->cascadeOnDelete();
            $table->foreign('id_usuario_proponente')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('id_usuario_destinatario')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
