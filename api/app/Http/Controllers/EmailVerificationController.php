<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VerificationCode;
use App\Notifications\EmailVerificationCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmailVerificationController extends Controller
{
    // Envia código (chamado no register e no resend)
    public static function sendCode(User $user): void
    {
        // Invalida códigos anteriores do mesmo tipo
        VerificationCode::where('email', $user->email)
            ->where('type', 'email_verification')
            ->delete();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        VerificationCode::create([
            'email'      => $user->email,
            'code'       => $code,
            'type'       => 'email_verification',
            'expires_at' => now()->addMinutes(15),
        ]);

        $user->notify(new EmailVerificationCodeNotification($code));
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-mail já verificado.'], 400);
        }

        $record = VerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', 'email_verification')
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Código inválido.'], 400);
        }

        if ($record->isExpired()) {
            $record->delete();
            return response()->json(['message' => 'Código expirado.'], 400);
        }

        $user->markEmailAsVerified();
        $record->delete();

        return response()->json(['message' => 'E-mail verificado com sucesso.']);
    }

    public function resend(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email:rfc,dns',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-mail já verificado.'], 400);
        }

        self::sendCode($user);

        return response()->json(['message' => 'Código de verificação reenviado.'], 200);
    }
}
