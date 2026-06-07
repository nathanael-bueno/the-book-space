<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_trade',
        'id_avaliador',
        'id_avaliado',
        'nota',
        'comentario',
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

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_avaliador');
    }

    public function reviewedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_avaliado');
    }
}
