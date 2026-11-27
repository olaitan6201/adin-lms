<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="{{ match (config('branding.palette')) { 'navy' => '#19385b', 'teal' => '#134e4a', default => '#10B981' } }}">
    <link rel="manifest" href="{{ request()->routeIs('workspace.*') ? '/workspace.webmanifest' : '/portal.webmanifest' }}">
    <link rel="icon" href="/brand/adin/crest.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    @viteReactRefresh
    @vite('resources/js/app.tsx')
    @inertiaHead
</head>
<body class="**:data-[slot=button]:transition-colors **:data-[slot=progress-indicator]:transition-transform **:data-[slot=sidebar-rail]:transition-none motion-reduce:**:transition-none! motion-reduce:**:animate-none!"
      data-palette="{{ config('branding.palette') }}" data-courses="{{ route('courses.index', [], false) }}" data-profile="{{ route('profile.edit', [], false) }}"
      data-inbox="{{ route('community.inbox', [], false) }}"
      data-reports="{{ route('insights.reports', [], false) }}"
      data-search="{{ Route::has('mobile.search') ? route('mobile.search', [], false) : '' }}">
    @inertia
</body>
</html>
