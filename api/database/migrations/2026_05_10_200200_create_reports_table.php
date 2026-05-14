<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('motivo');
            $table->string('alvo', 255);
            // denunciante is stored as plain string (username/display) so that it
            // survives account deletion without breaking the moderation history.
            $table->string('denunciante', 180);
            $table->foreignUuid('id_denunciante')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['Pendente', 'Aprovada', 'Rejeitada'])->default('Pendente');
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
