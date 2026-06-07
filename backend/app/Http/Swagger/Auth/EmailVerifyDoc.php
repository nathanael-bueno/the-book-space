<?php

namespace App\Http\Swagger\Auth;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/email/verify',
    operationId: 'emailVerify',
    summary: 'Verificar e-mail do usuário com código',
    tags: ['Verificação de E-mail'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email', 'code'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'joao@email.com'),
                new OA\Property(property: 'code',  type: 'string', minLength: 6, maxLength: 6, example: '123456'),
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'E-mail verificado com sucesso',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'E-mail verificado com sucesso.'),
                ]
            )
        ),
        new OA\Response(
            response: 400,
            description: 'Código inválido, expirado ou e-mail já verificado',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Código inválido.'),
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
                    new OA\Property(property: 'message', type: 'string', example: 'The code field is required.'),
                    new OA\Property(
                        property: 'errors',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'code',
                                type: 'array',
                                items: new OA\Items(type: 'string', example: 'O campo code deve ter 6 caracteres.')
                            ),
                        ]
                    ),
                ]
            )
        ),
    ]
)]
class EmailVerifyDoc {}
