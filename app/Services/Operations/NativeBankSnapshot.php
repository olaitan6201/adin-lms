<?php

namespace App\Services\Operations;

use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;

final class NativeBankSnapshot
{
    public array $banks = [];

    public array $bankIndex = [];

    public array $versionIndex = [];

    public function __construct(?string $course)
    {
        $size = 0;
        $count = 0;
        foreach (QuestionBank::where('course_id', $course)->orderBy('id')->limit(21)->cursor() as $b => $bank) {
            NativeRules::check($b < 20, 'A native backup supports up to 20 course banks.');
            $this->bankIndex[$bank->id] = $b;
            $questions = [];
            foreach (Question::where('bank_id', $bank->id)->orderBy('id')->limit(101)->cursor() as $q => $question) {
                NativeRules::check($q < 100);
                $versions = [];
                foreach (QuestionVersion::where('question_id', $question->id)->orderBy('revision')->limit(21)->cursor() as $v => $version) {
                    NativeRules::check($v < 20 && ++$count <= 300, 'Too many question revisions in this package.');
                    $row = ['revision' => $version->revision, 'kind' => $version->kind->value, 'prompt' => $version->prompt,
                        'options' => $version->options, 'key' => $version->marking_key];
                    $size += strlen(json_encode($row, JSON_THROW_ON_ERROR));
                    NativeRules::check($size <= 1048576, 'Question banks exceed the manifest limit.');
                    $versions[] = $row;
                    $this->versionIndex[$version->id] = [$b, $q, $v];
                }
                $questions[] = $versions;
            }
            $this->banks[] = ['topic' => $bank->topic, 'questions' => $questions];
        }
    }
}
