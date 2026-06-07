<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'propostas_troca'     => 'sometimes|boolean',
            'respostas_troca'     => 'sometimes|boolean',
            'curtidas'            => 'sometimes|boolean',
            'comentarios'         => 'sometimes|boolean',
            'confirmacoes_doacao' => 'sometimes|boolean',
            'recebe_email'        => 'sometimes|boolean',
        ];
    }
}
