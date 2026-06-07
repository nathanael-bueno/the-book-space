<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            'Romance',
            'Fantasia',
            'Ficcao Cientifica',
            'Tecnologia',
            'Biografia',
            'Infantil',
            'Misterio',
            'Autoajuda',
            'Historia',
            'Poesia',
        ];

        foreach ($genres as $nome) {
            Genre::firstOrCreate(['nome' => $nome]);
        }
    }
}
