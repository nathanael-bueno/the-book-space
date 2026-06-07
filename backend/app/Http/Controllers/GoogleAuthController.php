<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable) {
            return $this->redirectWithError('Falha ao autenticar com o Google.');
        }

        if (!$googleUser->getEmail()) {
            return $this->redirectWithError('A conta Google precisa ter e-mail publico.');
        }

        $user = User::firstOrNew(['email' => Str::lower($googleUser->getEmail())]);

        if (!$user->exists) {
            $user->nome_completo = $googleUser->getName() ?: 'Usuario Google';
            $user->senha_hash = Hash::make(Str::random(32));
            $user->auth_provider = 'google';
            $user->role = UserRole::USUARIO;
            $user->password_changed_at = now();
        }

        if ($user->auth_provider !== 'google') {
            $user->auth_provider = 'google';
        }

        $providerId = $googleUser->getId();
        if ($providerId) {
            $user->provider_id = $providerId;
        }

        if (!$user->foto && $googleUser->getAvatar()) {
            $user->foto = $googleUser->getAvatar();
        }

        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
        }

        $user->save();

        $token = JWTAuth::fromUser($user);

        return redirect()->away($this->frontendUrl('/auth/google/callback?token=' . urlencode($token)));
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        return redirect()->away($this->frontendUrl('/auth/login?error=' . urlencode($message)));
    }

    private function frontendUrl(string $path): string
    {
        $base = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
        return $base . $path;
    }
}
