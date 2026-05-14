<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome_completo');
            $table->string('email')->unique();
            $table->string('senha_hash');
            $table->string('auth_provider', 30)->default('local');
            $table->string('provider_id', 191)->nullable();
            $table->enum('role', ['administrador', 'usuario'])->default('usuario');
            $table->string('instituicao', 180)->nullable();
            $table->string('foto', 500)->nullable();
            $table->text('bio')->nullable();
            $table->string('cidade', 120)->nullable();
            $table->string('estado', 2)->nullable();
            $table->string('faixa_etaria', 20)->nullable();
            $table->decimal('nota', 3, 2)->default(0);
            $table->enum('status', ['ativo', 'inativo', 'bloqueado', 'suspenso'])->default('ativo');
            $table->jsonb('notification_preferences')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamp('password_changed_at')->nullable();
            $table->index(['auth_provider']);
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
