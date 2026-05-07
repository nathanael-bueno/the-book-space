<?php

namespace App\Http\Controllers;

use App\Http\Requests\loginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(StoreUserRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dados invalidos.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $user = User::create([
            'nome_completo' => $validated['nome_completo'],
            'email'         => $validated['email'],
            'senha_hash'    => Hash::make($validated['senha']),
        ]);

        EmailVerificationController::sendCode($user);

        return response()->json([
            'message' => 'Usuario cadastrado com sucesso. Verifique seu e-mail para ativar a conta.',
            'user'    => $user,
        ], 201);
    }

    public function login(loginRequest $request): JsonResponse
{
    $credentials = $request->validated();

    $user = User::where('email', $credentials['email'])->first();

    if (!$user || !Hash::check($credentials['senha'], $user->senha_hash)) {
        return response()->json([
            'message' => 'Credenciais invalidas.',
        ], 401);
    }

    if (!$user->hasVerifiedEmail()) {
        return response()->json([
            'message' => 'E-mail não verificado. Verifique sua caixa de entrada.',
        ], 403);
    }

    $token = JWTAuth::fromUser($user);

    return response()->json([
        'message' => 'Login realizado com sucesso.',
        'token'   => $token,
    ], 200);
}

    public function me(): JsonResponse
    {
        return response()->json(auth()->user());
    }
}
