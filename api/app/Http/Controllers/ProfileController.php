<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function me(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'message' => 'Perfil carregado com sucesso.',
            'data' => $this->privateProfile($user),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $user->fill($request->validated());
        $user->save();

        return response()->json([
            'message' => 'Perfil atualizado com sucesso.',
            'data' => $this->privateProfile($user),
        ]);
    }

    public function showPublic(User $user): JsonResponse
    {
        $user->load(['books' => function ($query) {
            $query
                ->where('status', 'disponivel')
                ->latest()
                ->limit(20)
                ->select([
                    'id',
                    'id_usuario_dono',
                    'titulo',
                    'autor',
                    'fotos',
                    'estado_conservacao',
                    'status',
                ]);
        }]);

        return response()->json([
            'message' => 'Perfil publico carregado com sucesso.',
            'data' => $this->publicProfile($user),
        ]);
    }

    private function privateProfile(User $user): array
    {
        return [
            'id' => $user->id,
            'nome_completo' => $user->nome_completo,
            'email' => $user->email,
            'foto' => $user->foto,
            'bio' => $user->bio,
            'cidade' => $user->cidade,
            'estado' => $user->estado,
            'faixa_etaria' => $user->faixa_etaria,
            'nota' => $user->nota,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    private function publicProfile(User $user): array
    {
        return [
            'id' => $user->id,
            'nome_completo' => $user->nome_completo,
            'foto' => $user->foto,
            'bio' => $user->bio,
            'cidade' => $user->cidade,
            'estado' => $user->estado,
            'faixa_etaria' => $user->faixa_etaria,
            'nota' => $user->nota,
            'books' => $user->books,
        ];
    }
}
