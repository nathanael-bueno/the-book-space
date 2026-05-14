<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_DISPONIVEL = 'disponivel';
    public const STATUS_RESERVADO = 'reservado';
    public const STATUS_TROCADO = 'trocado';
    public const STATUS_DOADO = 'doado';
    public const STATUS_INDISPONIVEL = 'indisponivel';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'titulo',
        'autor',
        'isbn',
        'fotos',
        'estado_conservacao',
        'status',
        'descricao',
        'cidade',
        'id_usuario_dono',
        'id_genero',
    ];

    protected function casts(): array
    {
        return [
            'fotos' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario_dono');
    }

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class, 'id_genero');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'id_livro');
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class, 'id_livro');
    }
}
