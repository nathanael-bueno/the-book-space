<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|required|string|max:180',
            'conteudo' => 'sometimes|required|string|max:5000',
            'id_livro' => 'nullable|uuid|exists:books,id',
            'imagem_url' => 'nullable|url|max:1000',
            'imagem' => 'nullable|image|max:5120',
        ];
    }
}
