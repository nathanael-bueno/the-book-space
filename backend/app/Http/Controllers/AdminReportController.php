<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateReportStatusRequest;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class AdminReportController extends Controller
{
    public function index(): JsonResponse
    {
        $reports = Report::query()
            ->latest()
            ->get()
            ->map(fn (Report $r) => $r->toClientArray());

        return response()->json(['data' => $reports]);
    }

    public function updateStatus(UpdateReportStatusRequest $request, Report $report): JsonResponse
    {
        $report->status = $request->validated('status');
        $report->save();

        return response()->json([
            'message' => 'Status da denuncia atualizado.',
            'data'    => $report->toClientArray(),
        ]);
    }
}
