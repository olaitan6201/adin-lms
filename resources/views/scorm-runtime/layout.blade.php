<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') · {{ $branding['institution'] }}</title>
    <link rel="stylesheet" href="/scorm-desk.css" @isset($styleNonce) nonce="{{ $styleNonce }}" @endisset>
    @stack('scripts')
</head>
<body class="group m-0 bg-canvas font-sans text-ink wrap-anywhere" data-palette="{{ config('branding.palette') }}">
    <a class="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-3" href="#content">Skip to content</a>
    <header class="border-t-4 border-brand bg-rail text-white group-data-[palette=navy]:bg-[#19385b] group-data-[palette=teal]:bg-[#134e4a]">
        <div class="mx-auto max-w-6xl px-4 sm:px-8 py-4 text-xl font-semibold">
            <span>{{ $branding['institution'] }}</span>
            <small class="block text-sm font-normal">Learning management system</small>
        </div>
    </header>
    <nav class="border-b border-rule bg-white" aria-label="Course navigation">
        <div class="mx-auto max-w-6xl px-4 sm:px-8 flex flex-wrap items-center gap-x-3 text-sm">
            <a class="inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-4" href="{{ route('courses.index') }}">My courses</a>
            <span aria-hidden="true">/</span>
            <a class="inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-4" href="{{ route('courses.show', $offering) }}">{{ $offering->external_offering_id }}</a>
            <span aria-hidden="true">/</span>
            @yield('location')
        </div>
    </nav>
    @yield('content')
</body>
</html>
