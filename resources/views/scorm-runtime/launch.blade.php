@extends('scorm-runtime.layout')
@section('title', $reading['title'])
@section('location')
    <a class="inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-4" href="{{ route('scorm.index', $offering) }}">Readings</a>
@endsection
@push('scripts')
    <script src="/scorm-bridge.js" defer></script>
@endpush

@section('content')
    <main id="content" class="mx-auto max-w-6xl px-4 sm:px-8 py-8" tabindex="-1"
        data-origin="{{ $origin }}"
        data-endpoint="{{ $endpoint }}"
        data-reading="{{ json_encode($reading, JSON_THROW_ON_ERROR) }}"
        data-csrf="{{ csrf_token() }}">
        <header class="mb-6">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">Course reading</p>
            <h1 class="mt-1 text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">{{ $reading['title'] }}</h1>
            <p class="mt-1.5 text-[13.5px] leading-relaxed" id="notice" role="status">Opening isolated player…</p>
        </header>
        <iframe class="block h-[36rem] w-full rounded-2xl border border-rule bg-white sm:h-[34rem]" title="Isolated reading player"
            sandbox="allow-scripts allow-same-origin"
            referrerpolicy="no-referrer"></iframe>
        <a class="mt-2 inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-4" href="{{ route('scorm.index', $offering) }}">Back to readings</a>
    </main>
@endsection
