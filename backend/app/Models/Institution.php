<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institution extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = [
        'nome',
        'cidade',
        'email_contato',
        'telefone',
        'necessidades',
        'status',
        'tipo_ponto',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class, 'id_instituicao');
    }

    /** Maps DB row to the shape the admin client service expects. */
    public function toClientArray(): array
    {
        return [
            'id'      => $this->id,
            'name'    => $this->nome,
            'city'    => $this->cidade,
            'contact' => $this->email_contato,
            'status'  => $this->status,
            'pointType' => $this->tipo_ponto,
        ];
    }
}
