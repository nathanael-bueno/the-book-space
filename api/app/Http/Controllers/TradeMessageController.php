<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTradeMessageRequest;
use App\Models\Trade;
use App\Models\TradeMessage;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TradeMessageController extends Controller
{
    public function index(Trade $trade): JsonResponse
    {
        $user = auth()->user();
        if (!$this->isParticipant($trade, (string) $user->id)) {
            return response()->json(['message' => 'Voce nao tem acesso a esta troca.'], 403);
        }

        $messages = TradeMessage::query()
            ->with('sender:id,nome_completo,foto')
            ->where('id_trade', $trade->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $messages]);
    }

    public function store(StoreTradeMessageRequest $request, Trade $trade): JsonResponse
    {
        $user = auth()->user();
        if (!$this->isParticipant($trade, (string) $user->id)) {
            return response()->json(['message' => 'Voce nao tem acesso a esta troca.'], 403);
        }

        if ($trade->status !== Trade::STATUS_ACEITA && $trade->status !== Trade::STATUS_CONCLUIDA) {
            return response()->json(['message' => 'O chat so fica disponivel para trocas aceitas.'], 422);
        }

        $targetUserId = (string) $trade->id_usuario_proponente === (string) $user->id
            ? (string) $trade->id_usuario_destinatario
            : (string) $trade->id_usuario_proponente;

        $message = DB::transaction(function () use ($request, $trade, $user, $targetUserId) {
            $message = TradeMessage::create([
                'id_trade' => $trade->id,
                'id_remetente' => $user->id,
                'mensagem' => trim((string) $request->validated('mensagem')),
            ]);

            UserNotification::create([
                'id_usuario' => $targetUserId,
                'tipo' => 'trade_message',
                'titulo' => 'Nova mensagem na troca',
                'descricao' => 'Voce recebeu uma nova mensagem no chat da troca.',
                'meta' => [
                    'trade_id' => $trade->id,
                    'action_to' => '/app/trades/' . $trade->id . '/chat',
                ],
            ]);

            return $message;
        });

        $message->load('sender:id,nome_completo,foto');

        return response()->json([
            'message' => 'Mensagem enviada com sucesso.',
            'data' => $message,
        ], 201);
    }

    private function isParticipant(Trade $trade, string $userId): bool
    {
        return (string) $trade->id_usuario_proponente === $userId
            || (string) $trade->id_usuario_destinatario === $userId;
    }
}
