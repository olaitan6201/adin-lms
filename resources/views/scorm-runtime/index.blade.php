@extends('scorm-runtime.layout')
@section('title', 'SCORM readings')
@section('location')
    <span aria-current="page">Readings</span>
@endsection

@section('content')
    <main id="content" class="mx-auto max-w-6xl px-4 sm:px-8 py-8" tabindex="-1">
        <header class="mb-6">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">Course materials</p>
            <h1 class="mt-1 text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">SCORM readings</h1>
            <p class="mt-1.5 text-[13.5px] leading-relaxed">{{ $staff ? 'Manage the reading exercises for this offering.' : 'Open a reading to begin or return to your saved note.' }}</p>
        </header>
        <div class="grid items-start gap-5 md:grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]">
            <section class="min-w-0 rounded-2xl border border-rule bg-white p-5 shadow-sm" aria-labelledby="collection">
                <h2 class="mb-3 text-[15px] font-semibold" id="collection">Reading list</h2>
                @forelse ($packages as $package)
                    <article class="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 py-4">
                        <h3 class="font-semibold">{{ $package->title }}</h3>
                        @unless ($staff)
                            <form action="{{ route('scorm.launch', [$offering, $package->id]) }}" method="post">
                                @csrf
                                <button class="min-h-11 rounded-md bg-forest px-4 py-2 font-semibold text-white hover:underline" type="submit" aria-label="Open reading: {{ $package->title }}">Open reading</button>
                            </form>
                        @endunless
                    </article>
                @empty
                    <p class="border-t border-neutral-200 py-4 text-neutral-600">No readings are available.</p>
                @endforelse
                @if ($packages->hasPages())
                    <nav class="flex flex-wrap gap-4" aria-label="Reading list pages">
                        @if ($packages->previousPageUrl())
                            <a class="inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-4" href="{{ $packages->previousPageUrl() }}">Previous readings</a>
                        @endif
                        @if ($packages->nextPageUrl())
                            <a class="inline-flex min-h-11 items-center font-medium text-forest underline underline-offset-4" href="{{ $packages->nextPageUrl() }}">More readings</a>
                        @endif
                    </nav>
                @endif
            </section>
            @if ($staff)
                <section class="min-w-0 rounded-2xl border border-rule bg-white p-5 shadow-sm" aria-labelledby="import-title">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">Lecturer workspace</p>
                    <h2 class="mb-3 text-[15px] font-semibold" id="import-title">Add a reading</h2>
                    <p>Registered learners can open it once the offering is published.</p>
                    <form action="{{ route('scorm.store', $offering) }}" method="post" enctype="multipart/form-data">
                        @csrf
                        <label class="mt-4 mb-1 block font-semibold" for="title">Reading title</label>
                        <input class="block min-h-11 w-full min-w-0 rounded-md border border-neutral-500 p-2" id="title" name="title" required maxlength="160" value="{{ old('title') }}"
                            @error('title') aria-invalid="true" aria-describedby="title-error" @enderror>
                        @error('title')
                            <p class="text-sm font-medium text-red-800" id="title-error" role="alert">{{ $message }}</p>
                        @enderror
                        <label class="mt-4 mb-1 block font-semibold" for="package">Reading v1 ZIP</label>
                        <p class="mb-1 text-sm text-neutral-600" id="package-hint">Choose a Reading v1 package, up to 128 KiB.</p>
                        <input class="block min-h-11 w-full min-w-0 rounded-md border border-neutral-500 p-2" id="package" type="file" name="package" accept=".zip" required
                            aria-describedby="package-hint{{ $errors->has('package') ? ' package-error' : '' }}"
                            @error('package') aria-invalid="true" @enderror>
                        @error('package')
                            <p class="text-sm font-medium text-red-800" id="package-error" role="alert">{{ $message }}</p>
                        @enderror
                        <button class="mt-5 min-h-11 rounded-md bg-forest px-4 py-2 font-semibold text-white hover:underline" type="submit">Import reading</button>
                    </form>
                </section>
            @endif
        </div>
    </main>
@endsection
