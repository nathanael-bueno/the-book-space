<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Models\VerificationCode;
use App\Notifications\LoginCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function register(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'nome_completo' => $validated['nome_completo'],
            'email'         => $validated['email'],
            'senha_hash'    => Hash::make($validated['senha']),
            'auth_provider' => 'local',
            'cidade'        => $validated['cidade'],
            'estado'        => $validated['estado'],
            'faixa_etaria'  => $validated['faixa_etaria'],
            'role'          => UserRole::USUARIO,
            'password_changed_at' => now(),
        ]);

        EmailVerificationController::sendCode($user);
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Usuario cadastrado com sucesso. Verifique seu e-mail para ativar a conta.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
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

        if (!$user->password_changed_at) {
            $user->password_changed_at = now();
            $user->save();
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'token'   => $token,
            'user'    => $user,
        ], 200);
    }

    public function me(): JsonResponse
    {
        return response()->json(auth()->user());
    }

    public function refresh(Request $request): JsonResponse
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
            $user = JWTAuth::setToken($newToken)->toUser();

            return response()->json([
                'message' => 'Token renovado com sucesso.',
                'token' => $newToken,
                'user' => $user,
            ]);
        } catch (JWTException) {
            return response()->json([
                'message' => 'Nao foi possivel renovar a sessao. Faca login novamente.',
            ], 401);
        }
    }

    public function loginStart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email:rfc,dns|max:150',
        ]);

        $email = strtolower(trim((string) $validated['email']));

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Nao encontramos uma conta com este e-mail.',
            ], 404);
        }

        if ($user->auth_provider === 'google') {
            $this->sendGoogleLoginCode($user);

            return response()->json([
                'message' => 'Enviamos um codigo para seu e-mail.',
                'method' => 'google_code',
                'email' => $user->email,
            ]);
        }

        return response()->json([
            'message' => 'Informe sua senha para continuar.',
            'method' => 'password',
            'email' => $user->email,
        ]);
    }

    public function loginWithCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email:rfc,dns|max:150',
            'code' => 'required|string|size:6',
        ]);

        $email = strtolower(trim((string) $validated['email']));
        $user = User::where('email', $email)->first();

        if (!$user || $user->auth_provider !== 'google') {
            return response()->json([
                'message' => 'Codigo invalido ou expirado.',
            ], 422);
        }

        $record = VerificationCode::where('email', $email)
            ->where('type', 'login_code')
            ->latest()
            ->first();

        if (!$record || $record->isExpired() || !Hash::check((string) $validated['code'], $record->code)) {
            if ($record && $record->isExpired()) {
                $record->delete();
            }

            return response()->json([
                'message' => 'Codigo invalido ou expirado.',
            ], 422);
        }

        $record->delete();

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    private function sendGoogleLoginCode(User $user): void
    {
        VerificationCode::where('email', $user->email)
            ->where('type', 'login_code')
            ->delete();

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        VerificationCode::create([
            'email'      => $user->email,
            'code'       => Hash::make($code),
            'type'       => 'login_code',
            'expires_at' => now()->addMinutes(10),
        ]);

        $user->notify(new LoginCodeNotification($code));
    }
}
