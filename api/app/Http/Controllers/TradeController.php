<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTradeRequest;
use App\Http\Requests\UpdateTradeStatusRequest;
use App\Models\Book;
use App\Models\Institution;
use App\Models\Trade;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TradeController extends Controller
{
    private const INDEX_RELATIONS = [
        'requestedBook:id,titulo,autor,estado_conservacao,fotos,id_usuario_dono',
        'offeredBook:id,titulo,autor,estado_conservacao,fotos,id_usuario_dono',
        'proponent:id,nome_completo,foto',
        'recipient:id,nome_completo,foto',
        'intermediaryInstitution:id,nome,cidade,tipo_ponto,status',
    ];

    private const DETAIL_RELATIONS = [
        'requestedBook:id,titulo,autor,estado_conservacao,fotos,id_usuario_dono,cidade',
        'offeredBook:id,titulo,autor,estado_conservacao,fotos,id_usuario_dono,cidade',
        'proponent:id,nome_completo,foto,cidade',
        'recipient:id,nome_completo,foto,cidade',
        'intermediaryInstitution:id,nome,cidade,tipo_ponto,status',
    ];

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        $trades = Trade::query()
            ->with(self::INDEX_RELATIONS)
            ->where(function ($query) use ($user) {
                $query
                    ->where('id_usuario_proponente', $user->id)
                    ->orWhere('id_usuario_destinatario', $user->id);
            })
            ->latest()
            ->paginate($perPage);

        return response()->json($trades);
    }

    public function show(Trade $trade): JsonResponse
    {
        $user = auth()->user();

        if (!$this->isParticipant($trade, (string) $user->id)) {
            return response()->json(['message' => 'Voce nao tem acesso a esta troca.'], 403);
        }

        $trade->load(self::DETAIL_RELATIONS);

        return response()->json([
            'message' => 'Troca carregada com sucesso.',
            'data' => $trade,
        ]);
    }

    public function store(StoreTradeRequest $request): JsonResponse
    {
        $user = auth()->user();
        $payload = $request->validated();

        $trade = DB::transaction(function () use ($payload, $user) {
            [$requestedBook, $offeredBook] = $this->lockAndResolveBooks(
                $payload['id_livro_solicitado'],
                $payload['id_livro_oferecido']
            );

            if ((string) $requestedBook->id_usuario_dono === (string) $user->id) {
                abort(422, 'Nao e possivel propor troca para um livro seu. Escolha um livro de outro usuario.');
            }

            if ((string) $offeredBook->id_usuario_dono !== (string) $user->id) {
                abort(403, 'Voce so pode oferecer livros cadastrados por voce.');
            }

            if ($requestedBook->status !== Book::STATUS_DISPONIVEL) {
                abort(422, 'O livro solicitado nao esta disponivel para troca.');
            }

            if ($offeredBook->status !== Book::STATUS_DISPONIVEL) {
                abort(422, 'O livro oferecido precisa estar com status disponivel para abrir a proposta.');
            }

            $intermediaryInstitutionId = $this->resolveIntermediaryInstitutionId(
                $payload['id_instituicao_intermediaria'] ?? null
            );

            return Trade::create([
                'id_livro_solicitado' => $requestedBook->id,
                'id_livro_oferecido' => $offeredBook->id,
                'id_usuario_proponente' => $user->id,
                'id_usuario_destinatario' => $requestedBook->id_usuario_dono,
                'id_instituicao_intermediaria' => $intermediaryInstitutionId,
                'mensagem' => $payload['mensagem'] ?? null,
                'status' => Trade::STATUS_PENDENTE,
            ]);
        });

        $this->notifyUser(
            (string) $trade->id_usuario_destinatario,
            'trade_proposal',
            'Nova proposta de troca recebida',
            'Voce recebeu uma proposta para um dos seus livros.',
            [
                'trade_id' => $trade->id,
                'action_to' => '/app/trades/' . $trade->id,
            ]
        );

        $trade->load(self::INDEX_RELATIONS);

        return response()->json([
            'message' => 'Proposta de troca enviada com sucesso.',
            'data' => $trade,
        ], 201);
    }

    public function updateStatus(UpdateTradeStatusRequest $request, Trade $trade): JsonResponse
    {
        $user = auth()->user();
        if (!$this->isParticipant($trade, (string) $user->id)) {
            return response()->json(['message' => 'Voce nao tem acesso a esta troca.'], 403);
        }

        $action = $request->validated('acao');
        $isProponent = (string) $trade->id_usuario_proponente === (string) $user->id;
        $isRecipient = (string) $trade->id_usuario_destinatario === (string) $user->id;

        if ($action === 'cancelar') {
            $response = $this->handleCancel($trade, $isProponent);
            if ($response) {
                return $response;
            }
        }

        if ($action === 'aceitar') {
            $response = $this->handleAccept($trade, $isRecipient);
            if ($response) {
                return $response;
            }
        }

        if ($action === 'recusar') {
            $response = $this->handleReject($trade, $isRecipient);
            if ($response) {
                return $response;
            }
        }

        if ($action === 'confirmar') {
            $response = $this->handleConfirm($trade, $isProponent, $isRecipient);
            if ($response) {
                return $response;
            }
        }

        $trade->refresh();
        $trade->load(self::INDEX_RELATIONS);

        return response()->json([
            'message' => 'Status da troca atualizado com sucesso.',
            'data' => $trade,
        ]);
    }

    private function handleCancel(Trade $trade, bool $isProponent): ?JsonResponse
    {
        if (!$isProponent) {
            return response()->json(['message' => 'Somente quem propôs a troca pode cancelar.'], 403);
        }
        if ($trade->status !== Trade::STATUS_PENDENTE) {
            return response()->json(['message' => 'Apenas trocas pendentes podem ser canceladas.'], 422);
        }

        $updated = Trade::query()
            ->whereKey($trade->id)
            ->where('status', Trade::STATUS_PENDENTE)
            ->update([
                'status' => Trade::STATUS_CANCELADA,
                'responded_at' => now(),
            ]);

        if ($updated === 0) {
            return response()->json(['message' => 'A troca nao esta mais pendente.'], 422);
        }

        $this->notifyUser(
            (string) $trade->id_usuario_destinatario,
            'trade_canceled',
            'Proposta de troca cancelada',
            'O proponente cancelou a proposta pendente.',
            [
                'trade_id' => $trade->id,
                'action_to' => '/app/trades/' . $trade->id,
            ]
        );

        return null;
    }

    private function handleAccept(Trade $trade, bool $isRecipient): ?JsonResponse
    {
        if (!$isRecipient) {
            return response()->json(['message' => 'Somente o destinatario pode aceitar a troca.'], 403);
        }
        if ($trade->status !== Trade::STATUS_PENDENTE) {
            return response()->json(['message' => 'Apenas trocas pendentes podem ser aceitas.'], 422);
        }

        DB::transaction(function () use ($trade): void {
            $lockedTrade = Trade::query()
                ->whereKey($trade->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedTrade->status !== Trade::STATUS_PENDENTE) {
                abort(422, 'Apenas trocas pendentes podem ser aceitas.');
            }

            $requested = Book::query()->whereKey($lockedTrade->id_livro_solicitado)->lockForUpdate()->first();
            $offered = Book::query()->whereKey($lockedTrade->id_livro_oferecido)->lockForUpdate()->first();

            if (!$requested || !$offered) {
                abort(422, 'Livros da troca nao encontrados.');
            }

            if ($requested->status !== Book::STATUS_DISPONIVEL || $offered->status !== Book::STATUS_DISPONIVEL) {
                abort(422, 'A troca so pode ser aceita com livros disponiveis.');
            }

            $requested->status = Book::STATUS_RESERVADO;
            $offered->status = Book::STATUS_RESERVADO;
            $requested->save();
            $offered->save();

            $lockedTrade->status = Trade::STATUS_ACEITA;
            $lockedTrade->responded_at = now();
            $lockedTrade->save();
        });

        $this->notifyUser(
            (string) $trade->id_usuario_proponente,
            'trade_accepted',
            'Sua proposta foi aceita',
            'A troca foi aceita. Use o chat para combinar a entrega.',
            [
                'trade_id' => $trade->id,
                'action_to' => '/app/trades/' . $trade->id,
            ]
        );

        return null;
    }

    private function handleReject(Trade $trade, bool $isRecipient): ?JsonResponse
    {
        if (!$isRecipient) {
            return response()->json(['message' => 'Somente o destinatario pode recusar a troca.'], 403);
        }
        if ($trade->status !== Trade::STATUS_PENDENTE) {
            return response()->json(['message' => 'Apenas trocas pendentes podem ser recusadas.'], 422);
        }

        $updated = Trade::query()
            ->whereKey($trade->id)
            ->where('status', Trade::STATUS_PENDENTE)
            ->update([
                'status' => Trade::STATUS_RECUSADA,
                'responded_at' => now(),
            ]);

        if ($updated === 0) {
            return response()->json(['message' => 'A troca nao esta mais pendente.'], 422);
        }

        $this->notifyUser(
            (string) $trade->id_usuario_proponente,
            'trade_rejected',
            'Sua proposta foi recusada',
            'A proposta de troca foi recusada pelo destinatario.',
            [
                'trade_id' => $trade->id,
                'action_to' => '/app/trades/' . $trade->id,
            ]
        );

        return null;
    }

    private function handleConfirm(Trade $trade, bool $isProponent, bool $isRecipient): ?JsonResponse
    {
        if ($trade->status !== Trade::STATUS_ACEITA) {
            return response()->json(['message' => 'Apenas trocas aceitas podem ser confirmadas.'], 422);
        }

        $shouldNotifyCompletion = false;

        DB::transaction(function () use ($trade, $isProponent, $isRecipient, &$shouldNotifyCompletion): void {
            $lockedTrade = Trade::query()
                ->whereKey($trade->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedTrade->status !== Trade::STATUS_ACEITA) {
                abort(422, 'Apenas trocas aceitas podem ser confirmadas.');
            }

            if ($isProponent && !$lockedTrade->confirmado_proponente_at) {
                $lockedTrade->confirmado_proponente_at = now();
            }
            if ($isRecipient && !$lockedTrade->confirmado_destinatario_at) {
                $lockedTrade->confirmado_destinatario_at = now();
            }

            if ($lockedTrade->confirmado_proponente_at && $lockedTrade->confirmado_destinatario_at) {
                $requested = Book::query()->whereKey($lockedTrade->id_livro_solicitado)->lockForUpdate()->first();
                $offered = Book::query()->whereKey($lockedTrade->id_livro_oferecido)->lockForUpdate()->first();

                if (!$requested || !$offered) {
                    abort(422, 'Livros da troca nao encontrados.');
                }

                $requested->status = Book::STATUS_TROCADO;
                $offered->status = Book::STATUS_TROCADO;
                $requested->save();
                $offered->save();

                if ($lockedTrade->status !== Trade::STATUS_CONCLUIDA) {
                    $lockedTrade->status = Trade::STATUS_CONCLUIDA;
                    $shouldNotifyCompletion = true;
                }
            }

            $lockedTrade->save();
        });

        if ($shouldNotifyCompletion) {
            $this->notifyUser(
                (string) $trade->id_usuario_proponente,
                'trade_completed',
                'Troca concluida',
                'A troca foi concluida por ambas as partes.',
                [
                    'trade_id' => $trade->id,
                    'action_to' => '/app/trades/' . $trade->id,
                ]
            );

            $this->notifyUser(
                (string) $trade->id_usuario_destinatario,
                'trade_completed',
                'Troca concluida',
                'A troca foi concluida por ambas as partes.',
                [
                    'trade_id' => $trade->id,
                    'action_to' => '/app/trades/' . $trade->id,
                ]
            );
        }

        return null;
    }

    private function lockAndResolveBooks(string $requestedBookId, string $offeredBookId): array
    {
        $bookIds = [$requestedBookId, $offeredBookId];
        sort($bookIds);

        $lockedBooks = Book::query()
            ->whereIn('id', $bookIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $requestedBook = $lockedBooks->get($requestedBookId);
        $offeredBook = $lockedBooks->get($offeredBookId);

        if (!$requestedBook || !$offeredBook) {
            abort(404, 'Livro nao encontrado.');
        }

        return [$requestedBook, $offeredBook];
    }

    private function resolveIntermediaryInstitutionId(?string $institutionId): ?string
    {
        if (!$institutionId) {
            return null;
        }

        $institution = Institution::query()->whereKey($institutionId)->first();

        if (!$institution) {
            abort(422, 'Instituicao intermediaria invalida.');
        }

        if ($institution->status !== 'ativa') {
            abort(422, 'A instituicao intermediaria precisa estar ativa.');
        }

        if ($institution->tipo_ponto !== 'troca') {
            abort(422, 'A instituicao selecionada nao atende trocas.');
        }

        return $institutionId;
    }

    private function isParticipant(Trade $trade, string $userId): bool
    {
        return (string) $trade->id_usuario_proponente === $userId
            || (string) $trade->id_usuario_destinatario === $userId;
    }

    private function notifyUser(
        string $userId,
        string $type,
        string $title,
        ?string $description = null,
        ?array $meta = null
    ): void {
        UserNotification::create([
            'id_usuario' => $userId,
            'tipo' => $type,
            'titulo' => $title,
            'descricao' => $description,
            'meta' => $meta,
        ]);
    }
}
