<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialUserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@bookspace.com'],
            [
                'nome_completo' => 'Administrador Geral',
                'senha_hash' => Hash::make('Senha123!'),
                'role' => UserRole::ADMINISTRADOR,
                'instituicao' => 'Book Space',
                'cidade' => 'Belo Horizonte, MG',
                'bio' => 'Administrador do sistema para ambiente de desenvolvimento.',
                'status' => 'ativo',
                'nota' => 0,
                'email_verified_at' => now(),
            ]
        );
    }
}
