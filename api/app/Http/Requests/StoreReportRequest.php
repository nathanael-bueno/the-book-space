<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'motivo' => ['required', 'string', 'max:500'],
            'alvo'   => ['required', 'string', 'max:255'],
        ];
    }
}
