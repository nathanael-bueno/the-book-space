<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostLike;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;

class PostLikeController extends Controller
{
    public function store(Post $post): JsonResponse
    {
        $user = auth()->user();

        $like = PostLike::firstOrCreate([
            'id_post' => $post->id,
            'id_usuario' => $user->id,
        ]);

        if ($like->wasRecentlyCreated && (string) $post->id_usuario !== (string) $user->id) {
            $authorPreferences = $post->author?->getEffectiveNotificationPreferences() ?? [];
            if (($authorPreferences['curtidas'] ?? true) === true) {
                UserNotification::create([
                    'id_usuario' => $post->id_usuario,
                    'tipo' => 'curtida',
                    'titulo' => 'Nova curtida no seu post',
                    'descricao' => "{$user->nome_completo} curtiu sua publicacao.",
                    'meta' => [
                        'action_to' => '/app/feed',
                        'post_id' => $post->id,
                    ],
                ]);
            }
        }

        return response()->json([
            'message' => 'Post curtido com sucesso.',
            'data' => $like,
        ], 201);
    }

    public function destroy(Post $post): JsonResponse
    {
        $user = auth()->user();

        PostLike::query()
            ->where('id_post', $post->id)
            ->where('id_usuario', $user->id)
            ->delete();

        return response()->json([
            'message' => 'Curtida removida com sucesso.',
        ]);
    }
}
