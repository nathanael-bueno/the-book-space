<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;
use App\Models\Trade;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function byUser(User $user): JsonResponse
    {
        $reviews = Review::query()
            ->with('reviewer:id,nome_completo,foto')
            ->where('id_avaliado', $user->id)
            ->latest()
            ->get();

        return response()->json(['data' => $reviews]);
    }

    public function store(StoreReviewRequest $request, Trade $trade): JsonResponse
    {
        $user = auth()->user();
        $userId = (string) $user->id;

        if ((string) $trade->id_usuario_proponente !== $userId && (string) $trade->id_usuario_destinatario !== $userId) {
            return response()->json(['message' => 'Voce nao participa desta troca.'], 403);
        }

        if ($trade->status !== Trade::STATUS_CONCLUIDA) {
            return response()->json(['message' => 'Avaliacao so pode ser enviada apos concluir a troca.'], 422);
        }

        $reviewedUserId = (string) $trade->id_usuario_proponente === $userId
            ? (string) $trade->id_usuario_destinatario
            : (string) $trade->id_usuario_proponente;

        try {
            $review = DB::transaction(function () use ($trade, $user, $request, $reviewedUserId) {
                $review = Review::create([
                    'id_trade' => $trade->id,
                    'id_avaliador' => $user->id,
                    'id_avaliado' => $reviewedUserId,
                    'nota' => (int) $request->validated('nota'),
                    'comentario' => $request->validated('comentario'),
                ]);

                $this->recalculateRating($reviewedUserId);
                return $review;
            });
        } catch (QueryException $exception) {
            if ($exception->getCode() === '23505') {
                return response()->json(['message' => 'Voce ja avaliou esta troca.'], 422);
            }

            throw $exception;
        }

        UserNotification::create([
            'id_usuario' => $reviewedUserId,
            'tipo' => 'trade_review',
            'titulo' => 'Voce recebeu uma nova avaliacao',
            'descricao' => 'Uma nova avaliacao foi registrada no seu perfil.',
            'meta' => [
                'trade_id' => $trade->id,
                'action_to' => '/app/users/' . $reviewedUserId,
            ],
        ]);

        $review->load('reviewer:id,nome_completo,foto');

        return response()->json([
            'message' => 'Avaliacao enviada com sucesso.',
            'data' => $review,
        ], 201);
    }

    private function recalculateRating(string $userId): void
    {
        $avg = (float) Review::query()->where('id_avaliado', $userId)->avg('nota');
        $user = User::find($userId);
        if (!$user) {
            return;
        }

        $user->nota = round($avg, 2);
        $user->save();
    }
}
