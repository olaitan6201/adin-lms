<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

$screens = [
    'lecturer' => [
        'overview', 'courses', 'course', 'classroom', 'assignments', 'cbt', 'gradebook', 'attendance',
        'communication', 'calendar', 'reports', 'settings/notifications',
    ],
    'student' => [
        'overview', 'courses', 'course', 'assignments', 'exam', 'results', 'downloads',
        'communication', 'calendar', 'settings/notifications',
    ],
    'guardian' => ['progress', 'settings/notifications'],
];

foreach ($screens as $role => $pages) {
    Route::prefix($role)->name("workspace.$role.")->group(function () use ($role, $pages): void {
        foreach ($pages as $page) {
            $screen = "$role/$page";
            $path = match ($screen) {
                'student/downloads' => 'offline-downloads',
                default => $page,
            };
            $component = collect(explode('/', $screen))->map(fn (string $segment) => Str::studly($segment))->implode('/');
            Route::inertia($path, $screen === 'guardian/progress' ? 'Guardian/ApprovedProgress' : $component, [
                'screenKey' => $screen,
                'branding' => null,
                'portalIdentity' => null,
                'signedIn' => false,
                'academicLinks' => [],
            ])->name(str_replace('/', '.', $page));
        }
    });
}
