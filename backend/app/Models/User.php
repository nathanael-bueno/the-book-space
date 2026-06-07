<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail, CanResetPasswordContract
{
    use HasFactory, Notifiable, HasUuids, CanResetPassword;

    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = [
        'nome_completo',
        'email',
        'senha_hash',
        'auth_provider',
        'provider_id',
        'role',
        'instituicao',
        'foto',
        'bio',
        'cidade',
        'estado',
        'faixa_etaria',
        'nota',
        'status',
        'notification_preferences',
        'password_changed_at',
    ];

    protected $hidden = [
        'senha_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'          => 'datetime',
            'nota'                       => 'decimal:2',
            'role'                       => UserRole::class,
            'instituicao'                => 'string',
            'notification_preferences'   => 'array',
            'created_at'                 => 'datetime',
            'updated_at'                 => 'datetime',
            'password_changed_at'        => 'datetime',
        ];
    }

    public const DEFAULT_NOTIFICATION_PREFERENCES = [
        'propostas_troca'     => true,
        'respostas_troca'     => true,
        'curtidas'            => true,
        'comentarios'         => true,
        'confirmacoes_doacao' => true,
        'recebe_email'        => false,
    ];

    public function getEffectiveNotificationPreferences(): array
    {
        $stored = $this->notification_preferences ?? [];
        return array_merge(self::DEFAULT_NOTIFICATION_PREFERENCES, $stored);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMINISTRADOR;
    }

    public function scopeFromInstitution(Builder $query, ?string $instituicao): Builder
    {
        if ($instituicao === null || $instituicao === '') {
            return $query;
        }

        return $query->where('instituicao', $instituicao);
    }

    // JWT
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'email' => $this->email,
            'nome'  => $this->nome_completo,
            'role'  => $this->role instanceof UserRole ? $this->role->value : (string) $this->role,
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->senha_hash;
    }

    // Usa nossa Notification customizada com link apontando para o frontend
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function books(): HasMany
    {
        return $this->hasMany(Book::class, 'id_usuario_dono');
    }

    public function favoriteGenres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'user_favorite_genres', 'id_usuario', 'id_genero')
            ->withTimestamps();
    }

    public function proposedTrades(): HasMany
    {
        return $this->hasMany(Trade::class, 'id_usuario_proponente');
    }

    public function receivedTrades(): HasMany
    {
        return $this->hasMany(Trade::class, 'id_usuario_destinatario');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'id_avaliador');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'id_avaliado');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(UserNotification::class, 'id_usuario');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'id_usuario');
    }

    public function postLikes(): HasMany
    {
        return $this->hasMany(PostLike::class, 'id_usuario');
    }

    public function postComments(): HasMany
    {
        return $this->hasMany(PostComment::class, 'id_usuario');
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class, 'id_usuario');
    }
}
