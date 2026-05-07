<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Resposta genérica por segurança — não revela se o e-mail existe
        $status = Password::sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'message' => 'Se este e-mail estiver cadastrado, você receberá um link em breve.',
        ], 200);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'email'             => 'required|email:rfc,dns',
            'token'             => 'required|string',
            'senha'             => 'required|string|min:8|confirmed',
            // Campo no JSON: "senha_confirmation"
        ]);

        $status = Password::reset(
            [
                'email'                 => $request->email,
                'password'              => $request->senha,
                'password_confirmation' => $request->input('senha_confirmation'),
                'token'                 => $request->token,
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'senha_hash'     => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Token inválido ou expirado.',
            ], 400);
        }

        return response()->json([
            'message' => 'Senha redefinida com sucesso.',
        ], 200);
    }
}
