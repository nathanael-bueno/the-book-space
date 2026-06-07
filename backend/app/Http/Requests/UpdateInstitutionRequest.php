<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateInstitutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name'    => 'sometimes|string|max:180',
            'city'    => 'sometimes|string|max:120',
            'contact' => 'sometimes|email|max:180',
            'status'  => 'sometimes|string|in:ativa,pendente',
            'pointType' => 'sometimes|string|in:doacao,troca',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('status')) {
            $this->merge([
                'status' => Str::of((string) $this->input('status'))->trim()->lower()->value(),
            ]);
        }

        if ($this->has('pointType')) {
            $this->merge([
                'pointType' => Str::of((string) $this->input('pointType'))->trim()->lower()->value(),
            ]);
        }
    }
}
