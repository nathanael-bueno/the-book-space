<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserFavoriteGenreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => $user->favoriteGenres()->orderBy('nome')->get(['genres.id', 'genres.nome']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'genre_ids' => ['required', 'array', 'min:3', 'max:5'],
            'genre_ids.*' => ['required', 'uuid', 'distinct', 'exists:genres,id'],
        ]);

        $user = $request->user();
        $user->favoriteGenres()->sync($validated['genre_ids']);

        return response()->json([
            'message' => 'Categorias favoritas salvas com sucesso.',
            'data' => $user->favoriteGenres()->orderBy('nome')->get(['genres.id', 'genres.nome']),
        ]);
    }
}
