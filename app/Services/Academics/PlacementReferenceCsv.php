<?php

namespace App\Services\Academics;

use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Closure;
use Generator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class PlacementReferenceCsv
{
    private const array HEADER = ['kind', 'id', 'name', 'programme_id'];

    public function __construct(private ScopedAuthority $authority) {}

    /** @return Closure(): void */
    public function stream(User $actor): Closure
    {
        abort_unless($this->authority->registrarAllows($actor), 403);

        return $this->write(...);
    }

    private function write(): void
    {
        $output = fopen('php://output', 'wb');
        if ($output === false) {
            throw new RuntimeException('Could not open the placement reference CSV stream.');
        }

        try {
            foreach ($this->rows() as $row) {
                if (fputcsv($output, $row, escape: '') === false) {
                    throw new RuntimeException('Could not write the placement reference CSV.');
                }
            }
        } finally {
            fclose($output);
        }
    }

    /** @return Generator<int, array{string, string, string, string}> */
    private function rows(): Generator
    {
        yield self::HEADER;

        /** @var iterable<object{pathway_id: string, academic_programme_id: string, name: string, code: string}> $pathways */
        $pathways = DB::table('academic_pathways as pathway')
            ->join('specializations as track', 'track.id', '=', 'pathway.specialization_id')
            ->join('academic_programmes as programme', 'programme.id', '=', 'pathway.academic_programme_id')
            ->select(['pathway.id as pathway_id', 'pathway.academic_programme_id', 'track.name', 'programme.code'])
            ->orderBy('pathway.id')->cursor();
        foreach ($pathways as $row) {
            yield ['Pathway', $row->pathway_id, $this->csvText("$row->name ($row->code)"), $row->academic_programme_id];
        }

        foreach (['Session' => 'academic_sessions', 'Cohort' => 'entry_cohorts', 'Level' => 'programme_levels'] as $kind => $table) {
            $columns = $kind === 'Level' ? ['id', 'label', 'academic_programme_id'] : ['id', 'label'];
            /** @var iterable<object{id: string, label: string, academic_programme_id?: string}> $records */
            $records = DB::table($table)->select($columns)->orderBy('id')->cursor();
            foreach ($records as $row) {
                yield [$kind, $row->id, $this->csvText($row->label), $row->academic_programme_id ?? ''];
            }
        }
    }

    private function csvText(string $label): string
    {
        return preg_match('/\A(?:\s*[=+\-@]|[\t\r\n])/', $label) ? "'".$label : $label;
    }
}
