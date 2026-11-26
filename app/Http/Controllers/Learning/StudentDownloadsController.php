<?php

namespace App\Http\Controllers\Learning;

use App\Services\Learning\StudentDownloads;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class StudentDownloadsController
{
    public function __invoke(Request $request, StudentDownloads $downloads): Response
    {
        $student = $request->user()->student;
        abort_unless($student, 403);

        return Inertia::render('Learning/Downloads', ['materials' => $downloads->forStudent($student)]);
    }
}
