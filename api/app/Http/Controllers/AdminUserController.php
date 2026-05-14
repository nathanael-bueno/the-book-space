<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\AdminStoreUserRequest;
use App\Http\Requests\AdminOrganizedUsersRequest;
use App\Http\Requests\UpdateAdminUserStatusRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

// Status mapping between the admin client (EN/capitalised) and the DB (PT/lowercase).
// DB values: ativo | suspenso | inativo | bloqueado
// Client values: Ativo | Suspenso | Banido

class AdminUserController extends Controller
{
    private const DB_TO_CLIENT_STATUS = [
        'ativo'     => 'Ativo',
        'suspenso'  => 'Suspenso',
        'inativo'   => 'Suspenso',
        'bloqueado' => 'Banido',
    ];

    private const CLIENT_TO_DB_STATUS = [
        'Ativo'    => 'ativo',
        'Suspenso' => 'suspenso',
        'Banido'   => 'bloqueado',
    ];

    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderBy('nome_completo')
            ->get(['id', 'nome_completo', 'email', 'nota', 'status'])
            ->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->nome_completo,
                'email'      => $u->email,
                'reputation' => (float) $u->nota,
                'status'     => self::DB_TO_CLIENT_STATUS[$u->status] ?? 'Ativo',
            ]);

        return response()->json(['data' => $users]);
    }

    public function updateStatus(UpdateAdminUserStatusRequest $request, User $user): JsonResponse
    {
        $clientStatus = $request->validated('status');
        $dbStatus     = self::CLIENT_TO_DB_STATUS[$clientStatus] ?? 'ativo';

        $user->status = $dbStatus;
        $user->save();

        return response()->json([
            'message' => 'Status do usuario atualizado.',
            'data'    => [
                'id'     => $user->id,
                'status' => $clientStatus,
            ],
        ]);
    }

    public function store(AdminStoreUserRequest $request): JsonResponse
    {
        /** @var User $admin */
        $admin = auth()->user();
        $validated = $request->validated();

        $user = User::create([
            'nome_completo' => $validated['nome_completo'],
            'email' => $validated['email'],
            'senha_hash' => Hash::make($validated['senha']),
            'role' => UserRole::from($validated['role'] ?? UserRole::USUARIO->value),
            'instituicao' => $admin->instituicao,
            'status' => 'ativo',
        ]);

        return response()->json([
            'message' => 'Usuario cadastrado com sucesso na instituicao do administrador.',
            'data' => $user->only(['id', 'nome_completo', 'email', 'role', 'instituicao', 'status', 'created_at']),
        ], 201);
    }

    public function organized(AdminOrganizedUsersRequest $request): JsonResponse
    {
        /** @var User $admin */
        $admin = auth()->user();
        $validated = $request->validated();

        $institutionFilter = $validated['instituicao'] ?? $admin->instituicao;
        if ($institutionFilter !== $admin->instituicao) {
            return response()->json([
                'message' => 'Voce so pode consultar usuarios da sua propria instituicao.',
            ], 403);
        }

        $users = User::query()
            ->fromInstitution($admin->instituicao)
            ->when(
                !($validated['incluir_inativos'] ?? false),
                fn ($query) => $query->where('status', 'ativo')
            )
            ->orderBy('instituicao')
            ->orderBy('role')
            ->orderBy('nome_completo')
            ->get([
                'id',
                'nome_completo',
                'email',
                'role',
                'instituicao',
                'status',
                'created_at',
            ]);

        $grouped = $users
            ->groupBy('instituicao')
            ->map(function (Collection $institutionUsers, string $instituicao) {
                $administradores = $institutionUsers
                    ->filter(fn (User $user) => $user->role === UserRole::ADMINISTRADOR)
                    ->values();

                $usuarios = $institutionUsers
                    ->filter(fn (User $user) => $user->role === UserRole::USUARIO)
                    ->values();

                return [
                    'instituicao' => $instituicao,
                    'totais' => [
                        'administradores' => $administradores->count(),
                        'usuarios' => $usuarios->count(),
                    ],
                    'administradores' => $administradores,
                    'usuarios' => $usuarios,
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Usuarios organizados por instituicao e role.',
            'filtros' => [
                'instituicao' => $admin->instituicao,
                'incluir_inativos' => (bool) ($validated['incluir_inativos'] ?? false),
            ],
            'totais' => [
                'instituicoes' => $grouped->count(),
                'usuarios' => $users->count(),
            ],
            'data' => $grouped,
        ]);
    }
}
