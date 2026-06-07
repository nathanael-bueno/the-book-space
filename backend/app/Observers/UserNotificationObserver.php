<?php

namespace App\Observers;

use App\Events\NewUserNotification;
use App\Models\UserNotification;

class UserNotificationObserver
{
    public function created(UserNotification $notification): void
    {
        broadcast(new NewUserNotification($notification));
    }
}
