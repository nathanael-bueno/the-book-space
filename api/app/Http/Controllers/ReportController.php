<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function store(StoreReportRequest $request): JsonResponse
    {
        $user = $request->user();

        $report = Report::create([
            'motivo'         => $request->validated('motivo'),
            'alvo'           => $request->validated('alvo'),
            'denunciante'    => $user->nome_completo,
            'id_denunciante' => $user->id,
        ]);

        return response()->json([
            'message' => 'Denuncia registrada.',
            'data'    => $report->toClientArray(),
        ], 201);
    }
}
