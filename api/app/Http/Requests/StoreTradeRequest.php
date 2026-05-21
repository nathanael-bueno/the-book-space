<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTradeRequest extends FormRequest
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
            'id_livro_solicitado' => 'required|uuid|exists:books,id',
            'id_livro_oferecido' => 'required|uuid|exists:books,id|different:id_livro_solicitado',
            'id_instituicao_intermediadora' => 'nullable|uuid|exists:institutions,id',
            'mensagem' => 'nullable|string|max:1200',
        ];
    }
}
