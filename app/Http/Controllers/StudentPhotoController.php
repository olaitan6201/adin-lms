<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentPhoto;
use Illuminate\Http\Response;

class StudentPhotoController extends Controller
{
    public function __invoke(Student $student): Response
    {
        $photo = StudentPhoto::where('student_id', $student->id)->firstOrFail();

        return response(base64_decode($photo->jpeg_base64), 200, [
            'Content-Type' => 'image/jpeg', 'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
