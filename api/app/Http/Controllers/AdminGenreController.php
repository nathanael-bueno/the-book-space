<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdminGenreRequest;
use App\Http\Requests\UpdateAdminGenreRequest;
use App\Models\Genre;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;

class AdminGenreController extends Controller
{
    public function index(): JsonResponse
    {
        $genres = Genre::query()
            ->orderBy('nome')
            ->get(['id', 'nome', 'categoria'])
            ->map(fn (Genre $g) => [
                'id'       => $g->id,
                'name'     => $g->nome,
                'category' => $g->categoria ?? '',
            ]);

        return response()->json(['data' => $genres]);
    }

    public function store(StoreAdminGenreRequest $request): JsonResponse
    {
        $v = $request->validated();

        try {
            $genre = Genre::create([
                'nome'      => $v['name'],
                'categoria' => $v['category'] ?? null,
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json(['message' => 'Ja existe um genero com este nome.'], 422);
            }
            throw $e;
        }

        return response()->json([
            'message' => 'Genero criado com sucesso.',
            'data'    => ['id' => $genre->id, 'name' => $genre->nome, 'category' => $genre->categoria ?? ''],
        ], 201);
    }

    public function update(UpdateAdminGenreRequest $request, Genre $genre): JsonResponse
    {
        $v = $request->validated();

        try {
            $genre->fill([
                'nome'      => $v['name'] ?? $genre->nome,
                'categoria' => $v['category'] ?? $genre->categoria,
            ]);
            $genre->save();
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json(['message' => 'Ja existe um genero com este nome.'], 422);
            }
            throw $e;
        }

        return response()->json([
            'message' => 'Genero atualizado com sucesso.',
            'data'    => ['id' => $genre->id, 'name' => $genre->nome, 'category' => $genre->categoria ?? ''],
        ]);
    }

    public function destroy(Genre $genre): JsonResponse
    {
        $genre->delete();

        return response()->json(['message' => 'Genero removido com sucesso.']);
    }
}
