<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
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
            'titulo' => 'required|string|max:200',
            'autor' => 'required|string|max:150',
            'isbn' => 'nullable|string|max:20',
            'fotos' => 'required|array|min:1',
            'fotos.*' => 'required|string|max:500',
            'estado_conservacao' => 'required|string|max:50',
            'descricao' => 'nullable|string|max:2500',
            'cidade' => 'nullable|string|max:120',
            'id_genero' => 'required|uuid|exists:genres,id',
        ];
    }

    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'autor' => 'autor',
            'isbn' => 'ISBN',
            'fotos' => 'fotos',
            'fotos.*' => 'foto',
            'estado_conservacao' => 'estado de conservação',
            'descricao' => 'descrição',
            'cidade' => 'cidade',
            'id_genero' => 'gênero',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'string' => 'O campo :attribute deve ser um texto.',
            'max' => 'O campo :attribute não pode ter mais de :max caracteres.',
            'array' => 'O campo :attribute deve ser uma lista.',
            'min' => 'Adicione ao menos :min foto.',
            'uuid' => 'O campo :attribute é inválido.',
            'exists' => 'O :attribute selecionado não existe.',
        ];
    }
}
