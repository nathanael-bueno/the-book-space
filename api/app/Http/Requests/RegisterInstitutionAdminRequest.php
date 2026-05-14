<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class RegisterInstitutionAdminRequest extends FormRequest
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
            'senha' => 'required|string|min:6|max:20',
            'instituicao' => 'required|string|min:2|max:180',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nome_completo' => Str::of((string) $this->input('nome_completo'))->trim()->value(),
            'email' => Str::of((string) $this->input('email'))->trim()->lower()->value(),
            'instituicao' => Str::of((string) $this->input('instituicao'))->trim()->value(),
        ]);
    }
}
