<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Report;
use App\Models\Trade;
use App\Models\User;
use Illuminate\Http\JsonResponse;

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
}
