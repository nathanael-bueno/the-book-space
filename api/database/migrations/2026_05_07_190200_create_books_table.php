<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo', 200);
            $table->string('autor', 150);
            $table->string('isbn', 20)->nullable();
            $table->json('fotos')->nullable();
            $table->string('estado_conservacao', 50);
            $table->string('status', 20)->default('disponivel');
            $table->text('descricao')->nullable();
            $table->string('cidade', 120)->nullable();
            $table->foreignUuid('id_usuario_dono')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('id_genero')->nullable()->constrained('genres')->nullOnDelete();
            $table->timestamps();

            $table->index('id_usuario_dono');
            $table->index('id_genero');
            $table->index('titulo');
            $table->index('autor');
            $table->index('isbn');
            $table->unique(['id_usuario_dono', 'isbn']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
