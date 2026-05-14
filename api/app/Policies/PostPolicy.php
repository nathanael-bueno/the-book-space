<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function update(User $user, Post $post): bool
    {
        return (string) $post->id_usuario === (string) $user->id;
    }

    public function delete(User $user, Post $post): bool
    {
        return (string) $post->id_usuario === (string) $user->id;
    }
}
