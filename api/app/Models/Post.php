<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'titulo',
        'conteudo',
        'imagem_url',
        'id_livro',
        'id_usuario',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'id_livro');
    }
}
