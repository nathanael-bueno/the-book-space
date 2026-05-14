<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
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
            'titulo' => 'required|string|max:180',
            'conteudo' => 'required|string|max:5000',
            'id_livro' => 'nullable|uuid|exists:books,id',
            'imagem_url' => 'nullable|url|max:1000',
            'imagem' => 'nullable|image|max:5120',
        ];
    }
}
