<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateProfileRequest extends FormRequest
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
            'nome_completo' => 'sometimes|required|string|max:150',
            'bio' => 'nullable|string|max:1200',
            'cidade' => 'nullable|string|max:120',
            'estado' => 'nullable|string|size:2',
            'faixa_etaria' => 'nullable|string|in:13-17,18-24,25-34,35-44,45-54,55+',
            'foto' => 'nullable|url|max:500',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('cidade')) {
            $this->merge([
                'cidade' => Str::of((string) $this->input('cidade'))->trim()->value(),
            ]);
        }

        if ($this->has('estado')) {
            $this->merge([
                'estado' => Str::of((string) $this->input('estado'))->trim()->upper()->value(),
            ]);
        }
    }
}
