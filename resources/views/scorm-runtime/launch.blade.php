@extends('scorm-runtime.layout')
@section('title', $reading['title'])
@section('location')
    <a href="{{ route('scorm.index', $offering) }}">Readings</a>
@endsection
@push('scripts')
    <script src="/scorm-bridge.js" defer></script>
@endpush

@section('content')
    <main id="content" class="rail desk" tabindex="-1"
        data-origin="{{ $origin }}"
        data-endpoint="{{ $endpoint }}"
        data-reading="{{ json_encode($reading, JSON_THROW_ON_ERROR) }}"
        data-csrf="{{ csrf_token() }}">
        <header class="heading">
            <p class="eyebrow">Course reading</p>
            <h1>{{ $reading['title'] }}</h1>
            <p id="notice" role="status">Opening isolated player…</p>
        </header>
        <iframe class="player" title="Isolated reading player"
            sandbox="allow-scripts allow-same-origin"
            referrerpolicy="no-referrer"></iframe>
        <a class="back" href="{{ route('scorm.index', $offering) }}">Back to readings</a>
    </main>
@endsection
