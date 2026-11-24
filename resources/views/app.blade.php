<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="{{ config('branding.palette') === 'navy' ? '#19385b' : '#134e4a' }}">
    <link rel="manifest" href="/portal.webmanifest">
    <link rel="icon" href="/portal-mark.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/portal-192.png">
    @viteReactRefresh
    @vite('resources/js/app.tsx')
    @inertiaHead
</head>
<body data-institution="{{ config('branding.institution') }}" data-logo="{{ asset(config('branding.logo')) }}"
      data-palette="{{ config('branding.palette') }}" data-courses="{{ route('courses.index', [], false) }}" data-profile="{{ route('profile.edit', [], false) }}"
      data-inbox="{{ route('community.inbox', [], false) }}"
      data-dashboard="{{ route('insights.dashboard', [], false) }}" data-reports="{{ route('insights.reports', [], false) }}"
      data-search="{{ Route::has('mobile.search') ? route('mobile.search', [], false) : '' }}">
    @inertia
</body>
</html>
