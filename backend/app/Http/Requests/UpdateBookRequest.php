<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
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
            'titulo' => 'sometimes|required|string|max:200',
            'autor' => 'sometimes|required|string|max:150',
            'isbn' => 'nullable|string|max:20',
            'fotos' => 'sometimes|required|array|min:1',
            'fotos.*' => 'required_with:fotos|string|max:500',
            'estado_conservacao' => 'sometimes|required|string|max:50',
            'status' => 'sometimes|required|string|in:disponivel,reservado,trocado,doado,indisponivel',
            'descricao' => 'nullable|string|max:2500',
            'opcoes_troca' => 'nullable|array|max:10',
            'opcoes_troca.*' => 'required|string|max:200',
            'cidade' => 'nullable|string|max:120',
            'id_genero' => 'nullable|uuid|exists:genres,id',
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
            'opcoes_troca' => 'opções de troca',
            'opcoes_troca.*' => 'opção de troca',
            'cidade' => 'cidade',
            'id_genero' => 'gênero',
            'status' => 'status',
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
            'in' => 'O valor informado para :attribute é inválido.',
        ];
    }
}
