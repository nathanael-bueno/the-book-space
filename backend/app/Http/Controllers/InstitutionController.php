<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        $institutions = Institution::query()
            ->where('status', 'ativa')
            ->orderBy('nome')
            ->paginate($perPage, [
                'id',
                'nome',
                'cidade',
                'email_contato',
                'telefone',
                'necessidades',
                'tipo_ponto',
            ]);

        return response()->json([
            'data' => $institutions->getCollection()->map(fn (Institution $institution) => [
                'id' => $institution->id,
                'name' => $institution->nome,
                'city' => $institution->cidade,
                'contact' => $institution->email_contato,
                'phone' => $institution->telefone,
                'needs' => $institution->necessidades,
                'pointType' => $institution->tipo_ponto,
            ]),
            'meta' => [
                'current_page' => $institutions->currentPage(),
                'last_page' => $institutions->lastPage(),
                'per_page' => $institutions->perPage(),
                'total' => $institutions->total(),
            ],
        ]);
    }

    public function show(Institution $institution): JsonResponse
    {
        if (mb_strtolower((string) $institution->status) !== 'ativa') {
            abort(404);
        }

        return response()->json([
            'data' => [
                'id' => $institution->id,
                'name' => $institution->nome,
                'city' => $institution->cidade,
                'contact' => $institution->email_contato,
                'phone' => $institution->telefone,
                'needs' => $institution->necessidades,
                'pointType' => $institution->tipo_ponto,
            ],
        ]);
    }
}
