<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('post_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_post')->constrained('posts')->cascadeOnDelete();
            $table->foreignUuid('id_usuario')->constrained('users')->cascadeOnDelete();
            $table->text('conteudo');
            $table->timestamps();

            $table->index(['id_post', 'created_at']);
            $table->index(['id_usuario', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_comments');
    }
};
