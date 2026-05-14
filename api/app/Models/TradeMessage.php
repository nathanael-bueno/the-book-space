<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TradeMessage extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_trade',
        'id_remetente',
        'mensagem',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function trade(): BelongsTo
    {
        return $this->belongsTo(Trade::class, 'id_trade');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_remetente');
    }
}
