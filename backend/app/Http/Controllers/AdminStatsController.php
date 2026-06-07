<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Report;
use App\Models\Trade;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $activeUsers      = User::where('status', 'ativo')->count();
        $completedTrades  = Trade::where('status', Trade::STATUS_CONCLUIDA)->count();
        $totalDonations   = Donation::count();
        $pendingReports   = Report::where('status', 'Pendente')->count();

        $recentUsers = User::query()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'nome_completo', 'email', 'created_at'])
            ->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->nome_completo,
                'email'      => $u->email,
                'created_at' => $u->created_at->format('d/m/Y, H:i'),
            ]);

        return response()->json([
            'data' => [
                'active_users'      => $activeUsers,
                'completed_trades'  => $completedTrades,
                'donations'         => $totalDonations,
                'pending_reports'   => $pendingReports,
                'recent_users'      => $recentUsers,
            ],
        ]);
    }

    public function donationsByInstitution(Request $request): JsonResponse
    {
        $from = $request->query('from');
        $to = $request->query('to');

        $rows = Donation::query()
            ->join('institutions', 'institutions.id', '=', 'donations.id_instituicao')
            ->where('donations.status', Donation::STATUS_CONCLUIDA)
            ->when($from, fn ($query) => $query->whereDate('donations.created_at', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('donations.created_at', '<=', $to))
            ->groupBy('institutions.id', 'institutions.nome')
            ->orderByDesc(DB::raw('count(*)'))
            ->selectRaw('institutions.id as institution_id, institutions.nome as institution_name, count(*) as total_donations')
            ->get()
            ->map(fn ($row) => [
                'institution_id' => $row->institution_id,
                'institution_name' => $row->institution_name,
                'total_donations' => (int) $row->total_donations,
            ]);

        return response()->json([
            'data' => $rows,
            'meta' => [
                'status' => Donation::STATUS_CONCLUIDA,
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }
}
