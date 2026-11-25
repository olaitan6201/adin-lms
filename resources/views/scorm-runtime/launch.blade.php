<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ $reading['title'] }}</title>
<main data-origin="{{ $origin }}" data-endpoint="{{ $endpoint }}" data-reading="{{ json_encode($reading, JSON_THROW_ON_ERROR) }}" data-csrf="{{ csrf_token() }}">
<a href="{{ route('scorm.index', $offering) }}">Back to readings</a>
<h1>{{ $reading['title'] }}</h1>
<iframe title="Isolated reading player" width="95%" height="490" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe>
<p id="notice" role="status">Opening isolated player…</p></main>
<script src="/scorm-bridge.js" defer></script></html>
