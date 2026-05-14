<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Enum;

class AdminStoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
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
            'role' => ['nullable', new Enum(UserRole::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nome_completo' => Str::of((string) $this->input('nome_completo'))->trim()->value(),
            'email' => Str::of((string) $this->input('email'))->trim()->lower()->value(),
            'role' => Str::of((string) $this->input('role', UserRole::USUARIO->value))->trim()->lower()->value(),
        ]);
    }
}
