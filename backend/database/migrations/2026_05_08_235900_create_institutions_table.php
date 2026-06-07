<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome', 180);
            $table->string('cidade', 120);
            $table->string('email_contato', 180);
            $table->string('telefone', 40)->nullable();
            $table->text('necessidades')->nullable();
            $table->string('status', 30)->default('ativa');
            $table->string('tipo_ponto', 30)->default('doacao');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
