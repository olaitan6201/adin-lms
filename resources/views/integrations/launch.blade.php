<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Open learning tool</title></head>
<body><main>
    <h1>Open learning tool</h1>
    <p>Continue to {{ parse_url($destination, PHP_URL_HOST) }} with your course role.</p>
    <form method="post" action="{{ $destination }}">
        <input type="hidden" name="id_token" value="{{ $token }}">
        <input type="hidden" name="state" value="{{ $state }}">
        <button type="submit">Continue to learning tool</button>
    </form>
</main></body></html>
