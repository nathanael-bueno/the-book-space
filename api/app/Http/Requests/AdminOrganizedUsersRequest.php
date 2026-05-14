<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class AdminOrganizedUsersRequest extends FormRequest
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
            'instituicao' => 'nullable|string|min:2|max:180',
            'incluir_inativos' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        $institution = $this->input('instituicao');

        $this->merge([
            'instituicao' => is_string($institution) ? Str::of($institution)->trim()->value() : $institution,
            'incluir_inativos' => filter_var($this->input('incluir_inativos', false), FILTER_VALIDATE_BOOL),
        ]);
    }
}
