<?php

namespace App\Services\Assessment;

use App\Models\Gradebook;
use App\Models\Offering;
use App\Models\User;
use App\Policies\AssessmentItemPolicy;

final class GradebookPolicyAccess
{
    public function __construct(private AssessmentItemPolicy $access) {}

    public function allows(?User $user, Offering $offering, ?Gradebook $book): bool
    {
        if ($user === null) {
            return false;
        }
        if ($this->access->examOfficer($user)) {
            return true;
        }

        return $book === null && $this->access->teaches($user, $offering);
    }

    public function assertAllows(?User $user, Offering $offering, ?Gradebook $book): void
    {
        abort_unless($this->allows($user, $offering, $book), 403);
    }
}
