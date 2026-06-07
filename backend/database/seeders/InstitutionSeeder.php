<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'nome' => 'Biblioteca Comunitaria Aurora',
                'cidade' => 'Belo Horizonte, MG',
                'email_contato' => 'contato@auroraleitora.org',
                'telefone' => '(31) 3333-1200',
                'necessidades' => 'Literatura infantil e livros paradidaticos',
                'status' => 'ativa',
            ],
            [
                'nome' => 'Instituto Paginas Abertas',
                'cidade' => 'Sao Paulo, SP',
                'email_contato' => 'doacoes@paginasabertas.org',
                'telefone' => '(11) 4002-2200',
                'necessidades' => 'Romances nacionais e livros de vestibular',
                'status' => 'ativa',
            ],
            [
                'nome' => 'Casa de Leitura Mar do Norte',
                'cidade' => 'Recife, PE',
                'email_contato' => 'leitura@mardonorte.org',
                'telefone' => '(81) 3222-4500',
                'necessidades' => 'Ficcao, poesia e livros em bom estado',
                'status' => 'ativa',
            ],
        ];

        foreach ($items as $item) {
            Institution::query()->updateOrCreate(
                ['email_contato' => $item['email_contato']],
                $item
            );
        }
    }
}
