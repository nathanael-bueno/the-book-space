<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = [
        'motivo',
        'alvo',
        'denunciante',
        'id_denunciante',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_denunciante');
    }

    public function toClientArray(): array
    {
        $created = $this->created_at;
        $now     = now();

        if ($created->isToday()) {
            $dateLabel = 'Hoje, ' . $created->format('H:i');
        } elseif ($created->isYesterday()) {
            $dateLabel = 'Ontem, ' . $created->format('H:i');
        } else {
            $dateLabel = $created->format('d/m/Y, H:i');
        }

        return [
            'id'        => $this->id,
            'reason'    => $this->motivo,
            'target'    => $this->alvo,
            'author'    => $this->denunciante,
            'createdAt' => $dateLabel,
            'status'    => $this->status,
        ];
    }
}
