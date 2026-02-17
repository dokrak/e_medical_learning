<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Question;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // 'App\\Models\\Model' => 'App\\Policies\\ModelPolicy',
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('create-question', function($user){
            return $user->hasRole('clinician') || $user->hasRole('admin');
        });
    }
}
