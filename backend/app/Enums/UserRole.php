<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMINISTRADOR = 'administrador';
    case USUARIO = 'usuario';

    public static function values(): array
    {
        return array_map(static fn (self $role) => $role->value, self::cases());
    }
}
