<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.jwt' => \PHPOpenSourceSaver\JWTAuth\Http\Middleware\Authenticate::class,
            'role.admin' => \App\Http\Middleware\EnsureAdminRole::class,
            'verified.email' => \App\Http\Middleware\EnsureVerifiedEmail::class,
            'token.fresh' => \App\Http\Middleware\EnsureFreshJwt::class,
            'active.user' => \App\Http\Middleware\EnsureActiveUser::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Token ausente ou invalido -> 401
        $exceptions->render(function (UnauthorizedHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Token inválido ou não informado.',
                ], 401);
            }
        });

        // Acesso negado -> 403
        $exceptions->render(function (AccessDeniedHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Acesso negado.',
                ], 403);
            }
        });
    })->create();
