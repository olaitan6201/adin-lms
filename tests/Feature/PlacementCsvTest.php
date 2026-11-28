<?php

namespace Tests\Feature;

use App\Enums\PlacementUpdateDisposition;
use App\Services\Academics\PlacementCsv;
use App\Services\Academics\PlacementUpdateOrder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

final class PlacementCsvTest extends TestCase
{
    public function test_school_registration_ids_are_kept_and_updates_are_read_as_full_rows(): void
    {
        $parser = new PlacementCsv;
        $keys = array_map(fn () => (string) Str::uuid7(), range(1, 4));
        $header = $parser->template();
        $content = "\xEF\xBB\xBF".$header.$this->row('0001', '12', $keys, '2028-02-29')
            .$this->row('0001', '11', $keys, '2028-01-05');
        $rows = $parser->read(UploadedFile::fake()->createWithContent('placement.csv', $content));

        $this->assertCount(2, $rows);
        $this->assertSame('0001', $rows[0]->registrationId);
        $this->assertSame(12, $rows[0]->updateNumber);
        $this->assertSame(11, $rows[1]->updateNumber);
        $this->assertSame('2028-02-29', $rows[0]->effectiveOn);
        $this->assertSame($keys[0], $rows[0]->pathwayId);
    }

    public function test_invalid_rows_are_reported_without_echoing_school_ids(): void
    {
        $parser = new PlacementCsv;
        $keys = array_map(fn () => (string) Str::uuid7(), range(1, 4));
        $content = $parser->template().$this->row('PRIVATE-REG-ID', '1', $keys, '2028-01-05')
            .$this->row('PRIVATE-REG-ID', '2', $keys, '2027-02-29');
        $file = UploadedFile::fake()->createWithContent('placement.csv', $content);

        try {
            $parser->read($file);
            $this->fail('Invalid calendar date was accepted.');
        } catch (ValidationException $error) {
            $this->assertStringContainsString('Row 3', $error->errors()['file'][0]);
            $this->assertStringNotContainsString('PRIVATE-REG-ID', $error->errors()['file'][0]);
        }
    }

    public function test_update_gaps_hold_and_accepted_numbers_cannot_be_reused_for_changes(): void
    {
        $parser = new PlacementCsv;
        $keys = array_map(fn () => (string) Str::uuid7(), range(1, 4));
        $rows = $parser->read(UploadedFile::fake()->createWithContent('placement.csv',
            $parser->template()
            .$this->row('0001', '12', $keys, '2028-02-29')
            .$this->row('0001', '11', $keys, '2028-01-05')
            .$this->row('0001', '11', $keys, '2028-01-05')
            .$this->row('0001', '11', $keys, '2028-01-06')
            .$this->row('0001', '11', $keys, '2028-01-05', '1')
            .$this->row('0001', '11', $keys, '2028-01-05', '0001'),
        ));
        [$later, $earlier, $replay, $conflict, $studentOne, $studentWithZeros] = $rows;
        $order = new PlacementUpdateOrder;
        $this->assertSame(PlacementUpdateDisposition::HeldForEarlierUpdate, $order->assess($later, 10));
        $this->assertSame(PlacementUpdateDisposition::ReadyForReview, $order->assess($earlier, 10));
        $this->assertSame(PlacementUpdateDisposition::ReadyForReview, $order->assess($later, 11));
        $this->assertSame(PlacementUpdateDisposition::ExactReplay, $order->assess($replay, 12, $earlier));
        $this->assertSame(PlacementUpdateDisposition::Conflict, $order->assess($conflict, 12, $earlier));
        $this->assertSame(PlacementUpdateDisposition::Conflict, $order->assess($studentWithZeros, 12, $studentOne));
    }

    public function test_unterminated_quoted_fields_are_not_repaired_into_valid_records(): void
    {
        $parser = new PlacementCsv;
        $keys = array_map(fn () => (string) Str::uuid7(), range(1, 4));
        $file = UploadedFile::fake()->createWithContent('placement.csv',
            $parser->template().$this->row('0001', '1', $keys, '"2028-01-05'),
        );

        $this->expectExceptionMessage('Row 2: use one well-formed CSV record per line.');
        $parser->read($file);
    }

    private function row(string $registration, string $number, array $keys, string $date, string $student = 'STUDENT-17'): string
    {
        return implode(',', [$registration, $number, $student, ...$keys, $date])."\r\n";
    }
}
