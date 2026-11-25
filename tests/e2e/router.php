<?php

use Illuminate\Http\Request;

// Test server only: use this run's built assets while other build jobs may
// regenerate public/build. Non-file URLs still exercise the actual kernel.
$public = realpath($_SERVER['DOCUMENT_ROOT']);
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = realpath($public.'/'.rawurldecode($path));

if ($file && str_starts_with($file, $public.'/') && is_file($file)) {
    return false;
}

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->usePublicPath($public);
$app->handleRequest(Request::capture());
