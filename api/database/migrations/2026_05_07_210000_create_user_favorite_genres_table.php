<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_favorite_genres', function (Blueprint $table) {
            $table->uuid('id_usuario');
            $table->uuid('id_genero');
            $table->timestamps();

            $table->primary(['id_usuario', 'id_genero']);
            $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('id_genero')->references('id')->on('genres')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_favorite_genres');
    }
};
