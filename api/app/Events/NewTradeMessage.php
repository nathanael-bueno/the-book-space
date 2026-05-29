<?php

namespace App\Events;

use App\Models\TradeMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewTradeMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TradeMessage $message)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('trade.' . $this->message->id_trade),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message->toArray(),
        ];
    }
}
