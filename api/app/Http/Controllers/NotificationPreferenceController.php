<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateNotificationPreferencesRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class NotificationPreferenceController extends Controller
{
    public function show(): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        return response()->json([
            'data' => $user->getEffectiveNotificationPreferences(),
        ]);
    }

    public function update(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $incoming = $request->validated();
        $current  = $user->getEffectiveNotificationPreferences();
        $merged   = array_merge($current, $incoming);

        $user->notification_preferences = $merged;
        $user->save();

        return response()->json([
            'message' => 'Preferencias de notificacao atualizadas.',
            'data'    => $merged,
        ]);
    }
}
