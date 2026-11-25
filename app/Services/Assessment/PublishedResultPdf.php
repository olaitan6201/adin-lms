<?php

namespace App\Services\Assessment;

use App\Models\Grade;
use Dompdf\Dompdf;
use Illuminate\Http\Response;

final class PublishedResultPdf
{
    /** @param array<int, array{item: string, points: string, maximum: string, weight: string, score_revision: int}> $inputs */
    public function download(Grade $grade, array $inputs): Response
    {
        $student = $grade->enrolment->student;
        $offering = $grade->enrolment->offering;
        $pdf = new Dompdf;
        $pdf->loadHtml(view('assessment.result-sheet', [
            'learner' => $student->user?->full_name ?? $student->external_student_id,
            'course' => $offering->curriculumCourse?->title,
            'offering' => $offering->external_offering_id,
            'grade' => $grade,
            'inputs' => $inputs,
        ])->render(), 'UTF-8');
        $pdf->setPaper('A4');
        $pdf->render();

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="result-'.$grade->id.'.pdf"',
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
