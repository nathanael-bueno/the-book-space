<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function __construct(private readonly Auth $auth)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->auth->guard()->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Acesso permitido apenas para administradores.',
            ], 403);
        }

        return $next($request);
    }
}
