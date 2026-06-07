<?php

namespace App\Http\Swagger\Auth;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/reset-password',
    operationId: 'resetPassword',
    summary: 'Redefinir senha com token recebido por e-mail',
    tags: ['Redefinição de Senha'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email', 'token', 'senha', 'senha_confirmation'],
            properties: [
                new OA\Property(property: 'email',              type: 'string', format: 'email', example: 'joao@email.com', description: 'E-mail do usuário (vem como query param no link)'),
                new OA\Property(property: 'token',              type: 'string', example: 'a1b2c3d4e5...',                  description: 'Token recebido via query param ?token= no link do e-mail'),
                new OA\Property(property: 'senha',              type: 'string', minLength: 8, example: 'novaSenha123'),
                new OA\Property(property: 'senha_confirmation', type: 'string', minLength: 8, example: 'novaSenha123'),
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Senha redefinida com sucesso',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Senha redefinida com sucesso.'),
                ]
            )
        ),
        new OA\Response(
            response: 400,
            description: 'Token inválido ou expirado (link válido por 1 hora)',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Token inválido ou expirado.'),
                ]
            )
        ),
        new OA\Response(
            response: 422,
            description: 'Dados inválidos',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'The senha field is required.'),
                    new OA\Property(
                        property: 'errors',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'senha',
                                type: 'array',
                                items: new OA\Items(type: 'string', example: 'O campo senha deve ter pelo menos 8 caracteres.')
                            ),
                            new OA\Property(
                                property: 'senha_confirmation',
                                type: 'array',
                                items: new OA\Items(type: 'string', example: 'O campo confirmação de senha não confere.')
                            ),
                        ]
                    ),
                ]
            )
        ),
    ]
)]
class ResetPasswordDoc {}
