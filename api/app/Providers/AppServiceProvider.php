<?php

namespace App\Providers;

use App\Models\Donation;
use App\Models\Post;
use App\Models\UserNotification;
use App\Observers\UserNotificationObserver;
use App\Policies\DonationPolicy;
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(Donation::class, DonationPolicy::class);

        UserNotification::observe(UserNotificationObserver::class);
    }
}
