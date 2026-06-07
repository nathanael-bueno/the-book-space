<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Documentação padrão
    |--------------------------------------------------------------------------
    | Nome da documentação padrão. Permite múltiplas documentações separadas.
    */
    'default' => 'default',

    'documentations' => [
        'default' => [
            'api' => [
                // Título exibido na interface do Swagger UI
                'title' => 'Minha API',
            ],

            'routes' => [
                // URL para acessar a interface visual do Swagger
                'api' => 'api/documentation',
            ],

            'paths' => [
                // Usa URL absoluta nos assets da UI
                'use_absolute_path' => env('L5_SWAGGER_USE_ABSOLUTE_PATH', true),

                // Nome do arquivo JSON gerado
                'docs_json' => 'api-docs.json',

                // Nome do arquivo YAML gerado (opcional)
                'docs_yaml' => 'api-docs.yaml',

                // Formato usado pela UI: 'json' ou 'yaml'
                'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),

                /*
                |--------------------------------------------------------------
                | Pasta(s) onde o pacote vai varrer as annotations @OA
                | Aponta para a pasta de documentação separada do projeto
                |--------------------------------------------------------------
                */
                'annotations' => [
                    base_path('app/Http'),
                ],
            ],
        ],
    ],

    'defaults' => [
        'routes' => [
            // Rota para o JSON/YAML gerado (acessado internamente pela UI)
            'docs' => 'docs',

            // Callback do OAuth2 (usado se você integrar com Passport)
            'oauth2_callback' => 'api/oauth2-callback',

            // Middlewares aplicados às rotas do Swagger
            'middleware' => [
                'api'            => [],
                'asset'          => [],
                'docs'           => [],
                'oauth2_callback' => [],
            ],

            // Opções adicionais do grupo de rotas
            'group_options' => [],
        ],

        'paths' => [
            // Onde o JSON/YAML gerado será salvo
            'docs' => storage_path('api-docs'),

            // Onde as views do Swagger UI serão publicadas
            'views' => base_path('resources/views/vendor/l5-swagger'),

            // Caminho base da API (null = detecta automaticamente)
            'base' => env('L5_SWAGGER_BASE_PATH', null),

            // Assets do Swagger UI
            'swagger_ui_assets_path' => env('L5_SWAGGER_UI_ASSETS_PATH', 'vendor/swagger-api/swagger-ui/dist/'),

            // Diretórios excluídos da varredura (use scanOptions.exclude de preferência)
            'excludes' => [],
        ],

        'scanOptions' => [
            // Analisador estático customizado (null = padrão do swagger-php)
            'analyser' => null,

            // Análise customizada (null = padrão)
            'analysis' => null,

            // Processadores customizados de query params
            'processors' => [
                // new \App\SwaggerProcessors\SchemaQueryParameter(),
            ],

            // Padrão de arquivos varridos (null = *.php)
            'pattern' => null,

            // Pastas excluídas da varredura (sobrescreve paths.excludes)
            'exclude' => [],

            // Versão da especificação OpenAPI: 3.0.0 ou 3.1.0
            'open_api_spec_version' => env(
                'L5_SWAGGER_OPEN_API_SPEC_VERSION',
                \L5Swagger\Generator::OPEN_API_DEFAULT_SPEC_VERSION
            ),
        ],

        /*
        |--------------------------------------------------------------------------
        | Definições de segurança
        |--------------------------------------------------------------------------
        | Configurado para Sanctum (Bearer Token via header Authorization)
        */
        'securityDefinitions' => [
            'securitySchemes' => [

                // Sanctum — Bearer Token
                'sanctum' => [
                    'type'        => 'apiKey',
                    'description' => 'Insira o token no formato: Bearer {seu_token}',
                    'name'        => 'Authorization',
                    'in'          => 'header',
                ],

                /*
                |--------------------------------------------------------------
                | Exemplos comentados para outros esquemas
                |--------------------------------------------------------------

                // API Key simples
                'api_key' => [
                    'type'        => 'apiKey',
                    'description' => 'Chave de API enviada no header',
                    'name'        => 'api_key',
                    'in'          => 'header',
                ],

                // OAuth2 com Passport
                'passport' => [
                    'type'        => 'oauth2',
                    'description' => 'OAuth2 via Laravel Passport',
                    'in'          => 'header',
                    'scheme'      => 'https',
                    'flows'       => [
                        'password' => [
                            'authorizationUrl' => config('app.url') . '/oauth/authorize',
                            'tokenUrl'         => config('app.url') . '/oauth/token',
                            'refreshUrl'       => config('app.url') . '/token/refresh',
                            'scopes'           => [],
                        ],
                    ],
                ],
                */
            ],

            'security' => [
                // Aplica o esquema globalmente (opcional)
                // ['sanctum' => []],
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Regeneração automática
        |--------------------------------------------------------------------------
        | true  → regenera a cada request (ideal para desenvolvimento)
        | false → não regenera automaticamente (use em produção)
        */
        'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', false),

        // Gera também uma cópia em YAML além do JSON
        'generate_yaml_copy' => env('L5_SWAGGER_GENERATE_YAML_COPY', false),

        // Confia no IP do proxy (necessário para AWS Load Balancer etc.)
        'proxy' => false,

        // URL de configuração externa para o Swagger UI (null = desativado)
        'additional_config_url' => null,

        /*
        |--------------------------------------------------------------------------
        | Ordenação das operações na UI
        |--------------------------------------------------------------------------
        | null     → ordem retornada pelo servidor
        | 'alpha'  → ordena por path alfabeticamente
        | 'method' → ordena por método HTTP
        */
        'operations_sort' => env('L5_SWAGGER_OPERATIONS_SORT', null),

        // URL do validador de spec (null = validação desativada)
        'validator_url' => null,

        /*
        |--------------------------------------------------------------------------
        | Configurações visuais do Swagger UI
        |--------------------------------------------------------------------------
        */
        'ui' => [
            'display' => [
                /*
                | Expansão padrão dos itens:
                | 'list' → expande só as tags
                | 'full' → expande tags e operações
                | 'none' → tudo recolhido
                */
                'doc_expansion' => env('L5_SWAGGER_UI_DOC_EXPANSION', 'list'),

                // Exibe barra de filtro no topo da UI
                'filter' => env('L5_SWAGGER_UI_FILTERS', true),
            ],

            'authorization' => [
                // Persiste o token de autorização após fechar/recarregar o browser
                'persist_authorization' => env('L5_SWAGGER_UI_PERSIST_AUTHORIZATION', false),

                'oauth2' => [
                    // Adiciona PKCE ao fluxo Authorization Code (OAuth2)
                    'use_pkce_with_authorization_code_grant' => false,
                ],
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Constantes disponíveis nas annotations
        |--------------------------------------------------------------------------
        | Usada em @OA\Server(url=L5_SWAGGER_CONST_HOST)
        */
        'constants' => [
            'L5_SWAGGER_CONST_HOST' => env('L5_SWAGGER_CONST_HOST', 'http://localhost'),
        ],
    ],
];