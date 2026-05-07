<?php

namespace App\Http\Swagger\Auth;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/register',
    summary: 'Cadastrar novo usuário',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['nome_completo', 'email', 'senha'],
            properties: [
                new OA\Property(property: 'nome_completo', type: 'string', maxLength: 150, example: 'João Silva'),
                new OA\Property(property: 'email',         type: 'string', format: 'email', example: 'joao@email.com'),
                new OA\Property(property: 'senha',         type: 'string', minLength: 6,    example: 'senha123'),
            ]
        )
    ),
    tags: ['Autenticação'],
    responses: [
        new OA\Response(
            response: 201,
            description: 'Usuário cadastrado com sucesso',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Usuario cadastrado com sucesso.'),
                    new OA\Property(
                        property: 'user',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'id',            type: 'integer', example: 1),
                            new OA\Property(property: 'nome_completo', type: 'string',  example: 'João Silva'),
                            new OA\Property(property: 'email',         type: 'string',  example: 'joao@email.com'),
                        ]
                    ),
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
                                items: new OA\Items(type: 'string', example: 'Este e-mail ja esta cadastrado.')
                            ),
                        ]
                    ),
                ]
            )
        ),
    ]
)]
class RegisterDoc {}
