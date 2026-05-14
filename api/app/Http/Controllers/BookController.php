<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Models\Book;
use App\Models\Trade;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $query = Book::query()->with(['owner:id,nome_completo,cidade,foto', 'genre:id,nome']);

        if ($request->filled('q')) {
            $search = trim((string) $request->query('q'));
            $query->where(function ($inner) use ($search) {
                $like = "%{$search}%";
                $inner
                    ->where('titulo', 'ilike', $like)
                    ->orWhere('autor', 'ilike', $like)
                    ->orWhere('isbn', 'ilike', $like);
            });
        }

        if ($request->filled('id_genero')) {
            $query->where('id_genero', $request->query('id_genero'));
        }

        if ($request->filled('estado_conservacao')) {
            $query->where('estado_conservacao', $request->query('estado_conservacao'));
        }

        if ($request->filled('cidade')) {
            $query->where('cidade', 'ilike', '%' . trim((string) $request->query('cidade')) . '%');
        }

        $books = $query->latest()->paginate($perPage);

        return response()->json($books);
    }

    public function show(Book $book): JsonResponse
    {
        $book->load(['owner:id,nome_completo,cidade,foto,bio,nota,status', 'genre:id,nome']);

        return response()->json([
            'message' => 'Livro carregado com sucesso.',
            'data' => $book,
        ]);
    }

    public function store(StoreBookRequest $request): JsonResponse
    {
        $user = auth()->user();
        $payload = $request->validated();
        $payload['id_usuario_dono'] = $user->id;

        try {
            $book = Book::create($payload);
        } catch (QueryException $exception) {
            if ($exception->getCode() === '23505') {
                return response()->json([
                    'message' => 'ISBN ja cadastrado para este usuario.',
                ], 422);
            }

            throw $exception;
        }

        $book->load(['owner:id,nome_completo,cidade,foto', 'genre:id,nome']);

        return response()->json([
            'message' => 'Livro cadastrado com sucesso.',
            'data' => $book,
        ], 201);
    }

    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        $user = auth()->user();
        if ((string) $book->id_usuario_dono !== (string) $user->id) {
            return response()->json([
                'message' => 'Apenas o dono pode editar este livro.',
            ], 403);
        }

        try {
            $book->fill($request->validated());
            $book->save();
        } catch (QueryException $exception) {
            if ($exception->getCode() === '23505') {
                return response()->json([
                    'message' => 'ISBN ja cadastrado para este usuario.',
                ], 422);
            }

            throw $exception;
        }

        $book->load(['owner:id,nome_completo,cidade,foto', 'genre:id,nome']);

        return response()->json([
            'message' => 'Livro atualizado com sucesso.',
            'data' => $book,
        ]);
    }

    public function destroy(Book $book): JsonResponse
    {
        $user = auth()->user();
        if ((string) $book->id_usuario_dono !== (string) $user->id) {
            return response()->json([
                'message' => 'Apenas o dono pode remover este livro.',
            ], 403);
        }

        DB::transaction(function () use ($book): void {
            $lockedBook = Book::query()->whereKey($book->id)->lockForUpdate()->firstOrFail();

            if ($lockedBook->status !== Book::STATUS_DISPONIVEL) {
                abort(422, 'Somente livros disponiveis podem ser removidos.');
            }

            $hasTradeHistory = Trade::query()
                ->where(function ($query) use ($lockedBook) {
                    $query
                        ->where('id_livro_solicitado', $lockedBook->id)
                        ->orWhere('id_livro_oferecido', $lockedBook->id);
                })
                ->exists();

            if ($hasTradeHistory) {
                abort(422, 'Este livro possui historico de troca e nao pode ser removido.');
            }

            $lockedBook->delete();
        });

        return response()->json([
            'message' => 'Livro removido com sucesso.',
        ]);
    }

    public function myBooks(): JsonResponse
    {
        $user = auth()->user();
        $books = Book::where('id_usuario_dono', $user->id)
            ->with('genre:id,nome')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Livros do usuario carregados com sucesso.',
            'data' => $books,
        ]);
    }
}
