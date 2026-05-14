<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInstitutionRequest;
use App\Http\Requests\UpdateInstitutionRequest;
use App\Models\Institution;
use Illuminate\Http\JsonResponse;

class AdminInstitutionController extends Controller
{
    public function index(): JsonResponse
    {
        $institutions = Institution::query()
            ->orderBy('nome')
            ->get()
            ->map(fn (Institution $i) => $i->toClientArray());

        return response()->json(['data' => $institutions]);
    }

    public function store(StoreInstitutionRequest $request): JsonResponse
    {
        $v = $request->validated();

        $institution = Institution::create([
            'nome'          => $v['name'],
            'cidade'        => $v['city'],
            'email_contato' => $v['contact'],
            'status'        => $v['status'],
            'tipo_ponto'    => $v['pointType'],
        ]);

        return response()->json([
            'message' => 'Instituicao criada com sucesso.',
            'data'    => $institution->toClientArray(),
        ], 201);
    }

    public function update(UpdateInstitutionRequest $request, Institution $institution): JsonResponse
    {
        $v = $request->validated();

        $institution->fill([
            'nome'          => $v['name'] ?? $institution->nome,
            'cidade'        => $v['city'] ?? $institution->cidade,
            'email_contato' => $v['contact'] ?? $institution->email_contato,
            'status'        => $v['status'] ?? $institution->status,
            'tipo_ponto'    => $v['pointType'] ?? $institution->tipo_ponto,
        ]);
        $institution->save();

        return response()->json([
            'message' => 'Instituicao atualizada com sucesso.',
            'data'    => $institution->toClientArray(),
        ]);
    }

    public function destroy(Institution $institution): JsonResponse
    {
        $institution->delete();

        return response()->json(['message' => 'Instituicao removida com sucesso.']);
    }
}
