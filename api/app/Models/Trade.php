<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trade extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_PENDENTE = 'pendente';
    public const STATUS_ACEITA = 'aceita';
    public const STATUS_RECUSADA = 'recusada';
    public const STATUS_CANCELADA = 'cancelada';
    public const STATUS_CONCLUIDA = 'concluida';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_livro_solicitado',
        'id_livro_oferecido',
        'id_usuario_proponente',
        'id_usuario_destinatario',
        'id_instituicao_intermediaria',
        'status',
        'mensagem',
        'responded_at',
        'confirmado_proponente_at',
        'confirmado_destinatario_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'confirmado_proponente_at' => 'datetime',
            'confirmado_destinatario_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function requestedBook(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'id_livro_solicitado');
    }

    public function offeredBook(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'id_livro_oferecido');
    }

    public function proponent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_proponente');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_destinatario');
    }

    public function intermediaryInstitution(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'id_instituicao_intermediaria');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TradeMessage::class, 'id_trade');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'id_trade');
    }
}
