<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome_completo' => 'required|string|max:150',
            'email' => 'required|string|email:rfc,dns|max:150|unique:users,email',
            'senha' => 'required|string|min:6|max:20',
        ];
    }
    public function messages(): array
    {
        return [
        'nome_completo.required' => 'O nome completo é obrigatório.',
        'email.required' => 'O e-mail é obrigatório.',
        'email.email'    => 'Informe um e-mail válido.',
        'email.unique'   => 'Este e-mail já está cadastrado.',
        'senha.required' => 'A senha é obrigatória.',
        ];
    }
}
