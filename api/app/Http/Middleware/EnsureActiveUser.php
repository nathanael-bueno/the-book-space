<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if ($user->status === 'ativo') {
            return $next($request);
        }

        return response()->json([
            'message' => 'Sua conta esta suspensa ou banida. Contate a administracao.',
        ], 403);
    }
}
