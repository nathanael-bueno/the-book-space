<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
            'nome_completo' => 'required|string|min:3|max:150',
            'email' => 'required|string|email:rfc,dns|max:150|unique:users,email',
            'senha' => ['required', 'string', Password::min(8)->letters()->mixedCase()->numbers()],
            'cidade' => 'required|string|min:2|max:120',
            'estado' => 'required|string|size:2',
            'faixa_etaria' => 'required|string|in:13-17,18-24,25-34,35-44,45-54,55+',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nome_completo' => Str::of((string) $this->input('nome_completo'))->trim()->value(),
            'email' => Str::of((string) $this->input('email'))->trim()->lower()->value(),
            'cidade' => Str::of((string) $this->input('cidade'))->trim()->value(),
            'estado' => Str::of((string) $this->input('estado'))->trim()->upper()->value(),
        ]);
    }

    public function messages(): array
    {
        return [
            'nome_completo.required' => 'O nome completo e obrigatorio.',
            'nome_completo.min' => 'O nome completo deve ter ao menos 3 caracteres.',
            'email.required' => 'O e-mail e obrigatorio.',
            'email.email' => 'Informe um e-mail valido.',
            'email.unique' => 'Este e-mail ja esta cadastrado.',
            'senha.required' => 'A senha e obrigatoria.',
            'cidade.required' => 'A cidade e obrigatoria.',
            'estado.required' => 'O estado e obrigatorio.',
            'estado.size' => 'Informe a sigla do estado com 2 letras.',
            'faixa_etaria.required' => 'A faixa etaria e obrigatoria.',
            'faixa_etaria.in' => 'Selecione uma faixa etaria valida.',
        ];
    }
}
