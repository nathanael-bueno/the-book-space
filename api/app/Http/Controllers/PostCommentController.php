<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostComment;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostCommentController extends Controller
{
    public function index(Post $post): JsonResponse
    {
        $perPage = min(max((int) request()->query('per_page', 20), 1), 100);

        $comments = PostComment::query()
            ->where('id_post', $post->id)
            ->with('author:id,nome_completo,foto')
            ->oldest()
            ->paginate($perPage);

        return response()->json($comments);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        $request->merge([
            'conteudo' => trim((string) $request->input('conteudo', '')),
        ]);

        $payload = $request->validate([
            'conteudo' => 'required|string|min:1|max:1000',
        ]);

        $user = auth()->user();
        $comment = PostComment::create([
            'id_post' => $post->id,
            'id_usuario' => $user->id,
            'conteudo' => trim((string) $payload['conteudo']),
        ]);
        $comment->load('author:id,nome_completo,foto');

        if ((string) $post->id_usuario !== (string) $user->id) {
            $authorPreferences = $post->author?->getEffectiveNotificationPreferences() ?? [];
            if (($authorPreferences['comentarios'] ?? true) === true) {
                UserNotification::create([
                    'id_usuario' => $post->id_usuario,
                    'tipo' => 'comentario',
                    'titulo' => 'Novo comentario no seu post',
                    'descricao' => "{$user->nome_completo} comentou sua publicacao.",
                    'meta' => [
                        'action_to' => '/app/feed',
                        'post_id' => $post->id,
                    ],
                ]);
            }
        }

        return response()->json([
            'message' => 'Comentario publicado com sucesso.',
            'data' => $comment,
        ], 201);
    }
}
