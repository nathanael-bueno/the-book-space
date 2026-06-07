<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreInstitutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:180',
            'city'    => 'required|string|max:120',
            'contact' => 'required|email|max:180',
            'status'  => 'required|string|in:ativa,pendente',
            'pointType' => 'required|string|in:doacao,troca',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => Str::of((string) $this->input('status'))->trim()->lower()->value(),
            'pointType' => Str::of((string) $this->input('pointType'))->trim()->lower()->value(),
        ]);
    }
}
