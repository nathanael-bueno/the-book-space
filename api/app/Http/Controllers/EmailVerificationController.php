<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VerificationCode;
use App\Notifications\EmailVerificationCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

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
            'code'       => Hash::make($code),
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
        $genericError = response()->json(['message' => 'Codigo invalido ou expirado.'], 422);

        if (!$user || $user->hasVerifiedEmail()) {
            return $genericError;
        }

        $record = VerificationCode::where('email', $request->email)
            ->where('type', 'email_verification')
            ->latest()
            ->first();

        if (!$record || $record->isExpired() || !Hash::check((string) $request->code, $record->code)) {
            if ($record && $record->isExpired()) {
                $record->delete();
            }
            return $genericError;
        }

        $user->markEmailAsVerified();
        $record->delete();

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'E-mail verificado com sucesso.',
            'token'   => $token,
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $email = $authUser?->email;

        if (!$email) {
            $request->validate([
                'email' => 'required|email',
            ]);
            $email = (string) $request->input('email');
        }

        $user = User::where('email', $email)->first();

        if ($user && !$user->hasVerifiedEmail()) {
            self::sendCode($user);
        }

        return response()->json(['message' => 'Se o e-mail for valido, um novo codigo sera enviado.'], 200);
    }
}
