<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_SOLICITADA = 'solicitada';
    public const STATUS_CONCLUIDA = 'concluida';
    public const STATUS_CANCELADA = 'cancelada';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_usuario',
        'id_instituicao',
        'id_livro',
        'observacoes',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'id_instituicao');
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'id_livro');
    }
}
