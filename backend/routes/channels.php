<?php

use App\Models\Trade;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('trade.{tradeId}', function ($user, $tradeId) {
    $trade = Trade::find($tradeId);
    if (!$trade) return false;
    return (string) $user->id === (string) $trade->id_usuario_proponente
        || (string) $user->id === (string) $trade->id_usuario_destinatario;
});

Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (string) $user->id === (string) $userId;
});
