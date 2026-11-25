<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SCORM readings</title>
<main><a href="{{ route('courses.show', $offering) }}">Back to course</a>
<h1>SCORM readings</h1>
@if ($staff)
<form action="{{ route('scorm.store', $offering) }}" method="post" enctype="multipart/form-data">@csrf
<p>Import a Reading v1 ZIP. Registered learners can open it when the offering is published.</p>
<label>Reading title <input name="title" required maxlength="160" value="{{ old('title') }}"></label>
<label>Reading v1 ZIP <input type="file" name="package" accept=".zip" required></label>
<button>Import reading</button></form>
@foreach ($errors->all() as $error)<p role="alert">{{ $error }}</p>@endforeach
@endif
@forelse ($packages as $package)
<section><h2>{{ $package->title }}</h2>
@unless ($staff)
<form action="{{ route('scorm.launch', [$offering, $package->id]) }}" method="post">@csrf<button>Open reading</button></form>
@endunless</section>
@empty<p>No readings are available.</p>@endforelse
@if ($packages->previousPageUrl())<a href="{{ $packages->previousPageUrl() }}">Previous readings</a>@endif
@if ($packages->nextPageUrl())<a href="{{ $packages->nextPageUrl() }}">More readings</a>@endif
</main></html>
