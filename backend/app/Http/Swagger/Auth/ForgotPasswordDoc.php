<?php

namespace App\Http\Swagger\Auth;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/forgot-password',
    operationId: 'forgotPassword',
    summary: 'Solicitar link de redefinição de senha',
    tags: ['Redefinição de Senha'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'joao@email.com'),
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Resposta genérica por segurança — um link é enviado ao e-mail caso esteja cadastrado',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Se este e-mail estiver cadastrado, você receberá um link em breve.'),
                ]
            )
        ),
        new OA\Response(
            response: 422,
            description: 'Dados inválidos',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'The email field is required.'),
                    new OA\Property(
                        property: 'errors',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'email',
                                type: 'array',
                                items: new OA\Items(type: 'string', example: 'O campo email é obrigatório.')
                            ),
                        ]
                    ),
                ]
            )
        ),
    ]
)]
class ForgotPasswordDoc {}
