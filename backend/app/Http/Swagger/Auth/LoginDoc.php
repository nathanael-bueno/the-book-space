<?php

namespace App\Http\Swagger\Auth;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/login',
    summary: 'Autenticar usuário',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email', 'senha'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'joao@email.com'),
                new OA\Property(property: 'senha', type: 'string', minLength: 6,    example: 'senha123'),
            ]
        )
    ),
    tags: ['Autenticação'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Login realizado com sucesso',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Login realizado com sucesso.'),
                    new OA\Property(property: 'token',   type: 'string', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Credenciais inválidas',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Credenciais invalidas.'),
                ]
            )
        ),
        new OA\Response(
            response: 422,
            description: 'Dados inválidos',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Dados invalidos.'),
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
class LoginDoc {}

#[OA\Get(
    path: '/api/me',
    summary: 'Retornar dados do usuário autenticado',
    security: [['bearerAuth' => []]],
    tags: ['Autenticação'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Dados do usuário',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'id',            type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000'),
                    new OA\Property(property: 'nome_completo', type: 'string', example: 'João Silva'),
                    new OA\Property(property: 'email',         type: 'string', example: 'joao@email.com'),
                    new OA\Property(property: 'created_at',    type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z'),
                    new OA\Property(property: 'updated_at',    type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z'),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Não autenticado',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Unauthenticated.'),
                ]
            )
        ),
    ]
)]
class MeDoc {}