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

        $targetLabel = $this->alvo;
        $contextPath = null;

        if (preg_match('/^\[(POST|REVIEW):([^\]]+)\]\s*(.*)$/', $this->alvo, $matches) === 1) {
            $type = $matches[1];
            $reference = $matches[2];
            $label = trim($matches[3]);

            if ($type === 'POST') {
                $targetLabel = $label !== '' ? 'Postagem: ' . $label : 'Postagem denunciada';
                $contextPath = '/app/feed';
            }

            if ($type === 'REVIEW') {
                $targetLabel = $label !== '' ? 'Avaliacao: ' . $label : 'Avaliacao denunciada';
                $contextPath = '/app/users/' . $reference;
            }
        }

        return [
            'id'        => $this->id,
            'reason'    => $this->motivo,
            'target'    => $targetLabel,
            'author'    => $this->denunciante,
            'createdAt' => $dateLabel,
            'status'    => $this->status,
            'contextPath' => $contextPath,
        ];
    }
}
