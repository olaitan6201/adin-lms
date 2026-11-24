<?php

namespace App\Listeners;

use App\Services\Security\AuthEvents;
use App\Services\Security\WebSessions;
use Illuminate\Auth\Events\CurrentDeviceLogout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class TrackWebAuthentication
{
    public function __construct(private WebSessions $sessions) {}

    public function handle(Login|Failed|Logout|CurrentDeviceLogout $event): void
    {
        if ($event->guard !== 'web') {
            return;
        }
        if ($event instanceof Failed) {
            AuthEvents::record($event->user, 'password.failed');
        } elseif ($event instanceof Login) {
            $this->sessions->start(request(), $event->user);
            AuthEvents::record($event->user, 'password.accepted');
        } elseif ($event->user && request()->hasSession()) {
            $this->sessions->end(request(), $event->user);
            AuthEvents::record($event->user, 'session.logout');
        }
    }
}
