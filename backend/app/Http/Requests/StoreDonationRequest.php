<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'id_instituicao' => $this->input('id_instituicao', $this->input('institutionId')),
            'id_livro' => $this->input('id_livro', $this->input('bookId')),
            'observacoes' => $this->input('observacoes', $this->input('notes')),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_instituicao' => 'required|uuid|exists:institutions,id,status,ativa',
            'id_livro' => 'required|uuid|exists:books,id',
            'observacoes' => 'nullable|string|max:2000',
        ];
    }
}
