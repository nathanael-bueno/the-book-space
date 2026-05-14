<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Book;
use App\Models\Post;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        $posts = Post::query()
            ->with([
                'author:id,nome_completo,foto',
                'book:id,titulo,autor,fotos',
            ])
            ->latest()
            ->paginate($perPage);

        return response()->json($posts);
    }

    public function show(Post $post): JsonResponse
    {
        $post->load([
            'author:id,nome_completo,foto',
            'book:id,titulo,autor,fotos',
        ]);

        return response()->json([
            'message' => 'Post carregado com sucesso.',
            'data' => $post,
        ]);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $user = auth()->user();
        $payload = $request->validated();

        if (!empty($payload['id_livro'])) {
            $book = Book::findOrFail($payload['id_livro']);
            if ((string) $book->id_usuario_dono !== (string) $user->id) {
                return response()->json([
                    'message' => 'Voce so pode vincular livros cadastrados por voce.',
                ], 403);
            }
        }

        $uploadedImageUrl = $this->resolveImageUrl($request);
        if ($uploadedImageUrl !== null) {
            $payload['imagem_url'] = $uploadedImageUrl;
        }

        $payload['id_usuario'] = $user->id;
        $post = Post::create($payload);
        $post->load(['author:id,nome_completo,foto', 'book:id,titulo,autor,fotos']);

        return response()->json([
            'message' => 'Post publicado com sucesso.',
            'data' => $post,
        ], 201);
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $user = auth()->user();

        try {
            $this->authorize('update', $post);
        } catch (AuthorizationException) {
            return response()->json([
                'message' => 'Apenas o autor pode editar este post.',
            ], 403);
        }

        $payload = $request->validated();
        if (!empty($payload['id_livro'])) {
            $book = Book::findOrFail($payload['id_livro']);
            if ((string) $book->id_usuario_dono !== (string) $user->id) {
                return response()->json([
                    'message' => 'Voce so pode vincular livros cadastrados por voce.',
                ], 403);
            }
        }

        $newImageUrl = $this->resolveImageUrl($request);
        if ($newImageUrl !== null) {
            $this->deleteStoredImage($post->imagem_url);
            $payload['imagem_url'] = $newImageUrl;
        }

        $post->fill($payload);
        $post->save();
        $post->load(['author:id,nome_completo,foto', 'book:id,titulo,autor,fotos']);

        return response()->json([
            'message' => 'Post atualizado com sucesso.',
            'data' => $post,
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        try {
            $this->authorize('delete', $post);
        } catch (AuthorizationException) {
            return response()->json([
                'message' => 'Apenas o autor pode remover este post.',
            ], 403);
        }

        $this->deleteStoredImage($post->imagem_url);
        $post->delete();

        return response()->json([
            'message' => 'Post removido com sucesso.',
        ]);
    }

    private function resolveImageUrl(Request $request): ?string
    {
        if (!$request->hasFile('imagem')) {
            return null;
        }

        $path = $request->file('imagem')->store('posts', 'public');
        return Storage::disk('public')->url($path);
    }

    private function deleteStoredImage(?string $url): void
    {
        if (!$url) {
            return;
        }

        $storagePrefix = '/storage/';
        $position = strpos($url, $storagePrefix);
        if ($position === false) {
            return;
        }

        $relativePath = substr($url, $position + strlen($storagePrefix));
        if ($relativePath !== '') {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
