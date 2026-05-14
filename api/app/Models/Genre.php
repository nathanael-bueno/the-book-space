<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Genre extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nome',
        'categoria',
    ];

    public function books(): HasMany
    {
        return $this->hasMany(Book::class, 'id_genero');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_favorite_genres', 'id_genero', 'id_usuario')
            ->withTimestamps();
    }
}
