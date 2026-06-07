<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDonationRequest;
use App\Models\Book;
use App\Models\Donation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $validated = $request->validate([
            'status' => ['nullable', Rule::in([
                Donation::STATUS_SOLICITADA,
                Donation::STATUS_CONCLUIDA,
                Donation::STATUS_CANCELADA,
            ])],
        ]);

        $donations = Donation::query()
            ->where('id_usuario', $user->id)
            ->when(
                isset($validated['status']),
                fn ($query) => $query->where('status', $validated['status'])
            )
            ->with([
                'institution:id,nome,cidade,email_contato,telefone',
                'book:id,titulo,autor,fotos,status',
            ])
            ->latest()
            ->paginate($perPage);

        return response()->json($donations);
    }

    public function store(StoreDonationRequest $request): JsonResponse
    {
        $user = auth()->user();
        $payload = $request->validated();

        $donation = DB::transaction(function () use ($payload, $user) {
            $book = Book::query()->whereKey($payload['id_livro'])->lockForUpdate()->firstOrFail();

            if ((string) $book->id_usuario_dono !== (string) $user->id) {
                abort(403, 'Voce so pode doar livros cadastrados por voce.');
            }

            if ($book->status !== Book::STATUS_DISPONIVEL) {
                abort(422, 'Somente livros disponiveis podem ser doados.');
            }

            $alreadyRequested = Donation::query()
                ->where('id_livro', $book->id)
                ->where('status', Donation::STATUS_SOLICITADA)
                ->lockForUpdate()
                ->exists();

            if ($alreadyRequested) {
                abort(422, 'Este livro ja possui uma solicitacao de doacao em andamento.');
            }

            $donation = Donation::create([
                'id_usuario' => $user->id,
                'id_instituicao' => $payload['id_instituicao'],
                'id_livro' => $payload['id_livro'],
                'observacoes' => $payload['observacoes'] ?? null,
                'status' => Donation::STATUS_SOLICITADA,
            ]);

            $book->status = Book::STATUS_RESERVADO;
            $book->save();

            return $donation;
        });

        $donation->load([
            'institution:id,nome,cidade,email_contato,telefone',
            'book:id,titulo,autor,fotos,status',
        ]);

        return response()->json([
            'message' => 'Solicitacao de doacao enviada com sucesso.',
            'data' => $donation,
        ], 201);
    }
}
