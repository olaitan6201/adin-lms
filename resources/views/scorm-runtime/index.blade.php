@extends('scorm-runtime.layout')
@section('title', 'SCORM readings')
@section('location')
    <span aria-current="page">Readings</span>
@endsection

@section('content')
    <main id="content" class="rail desk" tabindex="-1">
        <header class="heading">
            <p class="eyebrow">Course materials</p>
            <h1>SCORM readings</h1>
            <p>{{ $staff ? 'Manage the reading exercises for this offering.' : 'Open a reading to begin or return to your saved note.' }}</p>
        </header>
        <div @class(['columns' => $staff])>
            <section aria-labelledby="collection">
                <h2 id="collection">Reading list</h2>
                @forelse ($packages as $package)
                    <article class="reading-row">
                        <h3>{{ $package->title }}</h3>
                        @unless ($staff)
                            <form action="{{ route('scorm.launch', [$offering, $package->id]) }}" method="post">
                                @csrf
                                <button type="submit" aria-label="Open reading: {{ $package->title }}">Open reading</button>
                            </form>
                        @endunless
                    </article>
                @empty
                    <p class="empty">No readings are available.</p>
                @endforelse
                @if ($packages->hasPages())
                    <nav class="pagination" aria-label="Reading list pages">
                        @if ($packages->previousPageUrl())
                            <a href="{{ $packages->previousPageUrl() }}">Previous readings</a>
                        @endif
                        @if ($packages->nextPageUrl())
                            <a href="{{ $packages->nextPageUrl() }}">More readings</a>
                        @endif
                    </nav>
                @endif
            </section>
            @if ($staff)
                <section class="import" aria-labelledby="import-title">
                    <p class="eyebrow">Lecturer workspace</p>
                    <h2 id="import-title">Add a reading</h2>
                    <p>Registered learners can open it once the offering is published.</p>
                    <form action="{{ route('scorm.store', $offering) }}" method="post" enctype="multipart/form-data">
                        @csrf
                        <label for="title">Reading title</label>
                        <input id="title" name="title" required maxlength="160" value="{{ old('title') }}"
                            @error('title') aria-invalid="true" aria-describedby="title-error" @enderror>
                        @error('title')
                            <p id="title-error" role="alert">{{ $message }}</p>
                        @enderror
                        <label for="package">Reading v1 ZIP</label>
                        <p id="package-hint">Choose a Reading v1 package, up to 128 KiB.</p>
                        <input id="package" type="file" name="package" accept=".zip" required
                            aria-describedby="package-hint{{ $errors->has('package') ? ' package-error' : '' }}"
                            @error('package') aria-invalid="true" @enderror>
                        @error('package')
                            <p id="package-error" role="alert">{{ $message }}</p>
                        @enderror
                        <button type="submit">Import reading</button>
                    </form>
                </section>
            @endif
        </div>
    </main>
@endsection
