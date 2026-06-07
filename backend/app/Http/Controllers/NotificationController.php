<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $notifications = UserNotification::query()
            ->where('id_usuario', $user->id)
            ->latest()
            ->paginate(30);

        return response()->json($notifications);
    }

    public function markAsRead(UserNotification $notification): JsonResponse
    {
        $user = auth()->user();
        if ((string) $notification->id_usuario !== (string) $user->id) {
            return response()->json(['message' => 'Notificacao nao encontrada.'], 404);
        }

        if (!$notification->lida_em) {
            $notification->lida_em = now();
            $notification->save();
        }

        return response()->json([
            'message' => 'Notificacao marcada como lida.',
            'data' => $notification,
        ]);
    }
}
