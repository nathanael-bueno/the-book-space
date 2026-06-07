<?php

namespace App\Http\Swagger\Auth;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/email/resend',
    operationId: 'emailResend',
    summary: 'Reenviar código de verificação de e-mail',
    tags: ['Verificação de E-mail'],
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
            description: 'Código de verificação reenviado',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Código de verificação reenviado.'),
                ]
            )
        ),
        new OA\Response(
            response: 400,
            description: 'E-mail já verificado',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'E-mail já verificado.'),
                ]
            )
        ),
        new OA\Response(
            response: 404,
            description: 'Usuário não encontrado',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Usuário não encontrado.'),
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
class EmailResendDoc {}
