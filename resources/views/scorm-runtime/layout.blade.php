<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') · {{ $branding['institution'] }}</title>
    <link rel="stylesheet" href="/scorm-shell.css" @isset($styleNonce) nonce="{{ $styleNonce }}" @endisset>
    <link rel="stylesheet" href="/scorm-desk.css" @isset($styleNonce) nonce="{{ $styleNonce }}" @endisset>
    @stack('scripts')
</head>
<body data-palette="{{ config('branding.palette') }}">
    <a class="skip" href="#content">Skip to content</a>
    <header class="masthead">
        <div class="rail brand">
            <span>{{ $branding['institution'] }}</span>
            <small>Learning management system</small>
        </div>
    </header>
    <nav class="breadcrumbs" aria-label="Course navigation">
        <div class="rail">
            <a href="{{ route('courses.index') }}">My courses</a>
            <span aria-hidden="true">/</span>
            <a href="{{ route('courses.show', $offering) }}">{{ $offering->external_offering_id }}</a>
            <span aria-hidden="true">/</span>
            @yield('location')
        </div>
    </nav>
    @yield('content')
</body>
</html>
