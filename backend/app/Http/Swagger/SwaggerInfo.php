<?php

namespace App\Http\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Minha API',
    version: '1.0.0',
    description: 'Documentação da API Laravel bookspace',
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Servidor local'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
class SwaggerInfo {}