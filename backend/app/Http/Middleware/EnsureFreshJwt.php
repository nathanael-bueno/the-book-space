<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use Symfony\Component\HttpFoundation\Response;

class EnsureFreshJwt
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if (!$user->password_changed_at) {
            return $next($request);
        }

        try {
            $payload = JWTAuth::parseToken()->getPayload();
        } catch (TokenInvalidException|TokenExpiredException|JWTException) {
            return response()->json([
                'message' => 'Token invalido ou nao informado.',
            ], 401);
        }

        $issuedAt = Carbon::createFromTimestamp((int) $payload->get('iat'));

        if ($issuedAt->lt($user->password_changed_at)) {
            return response()->json([
                'message' => 'Sua sessao expirou. Faca login novamente.',
            ], 401);
        }

        return $next($request);
    }
}
