<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
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
            'email' => 'required|string|email:rfc,dns|max:150',
            'senha' => 'required|string|min:8|max:255',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => Str::of((string) $this->input('email'))->trim()->lower()->value(),
        ]);
    }

    public function messages(): array
    {
        return [
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Informe um e-mail válido.',
            'senha.required' => 'A senha é obrigatória.',
        ];
    }
}
