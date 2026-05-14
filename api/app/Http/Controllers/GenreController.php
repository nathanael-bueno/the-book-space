<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\JsonResponse;

class GenreController extends Controller
{
    public function index(): JsonResponse
    {
        $genres = Genre::query()->orderBy('nome')->get(['id', 'nome']);

        return response()->json([
            'data' => $genres,
        ]);
    }
}
