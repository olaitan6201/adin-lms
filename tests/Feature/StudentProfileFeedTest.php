<?php

namespace Tests\Feature;

use App\Enums\StudentStatus;
use App\Models\Student;
use Database\Seeders\DemoCampusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use ZipArchive;

class StudentProfileFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_profiles_use_stable_ids_preserve_accounts_and_rollback_invalid_file(): void
    {
        $this->seed(DemoCampusSeeder::class);
        $header = 'student_id,matric_number,name,email,programme,level,session,status,photo';
        $row = 'DEMO-ADA,ADA/001,Ada N,alternate@example.test,DEMO-BSC,100 (demo),2026/27 (demo),graduated,';
        $path = tempnam(sys_get_temp_dir(), 'profiles');
        try {
            file_put_contents(
                $path,
                "$header\n$row\n".str_replace(['DEMO-ADA', 'DEMO-BSC'], ['OTHER', 'UNKNOWN'], $row),
            );
            $this->artisan('roster:profiles', ['file' => $path])
                ->expectsOutput('Record 3: unknown programme_id reference.')
                ->assertFailed();
            $this->assertDatabaseEmpty('student_sessions');
            file_put_contents($path, "$header\n".str_replace('graduated', 'registered', $row));
            $this->artisan('roster:profiles', ['file' => $path])->assertFailed();
            $this->assertDatabaseEmpty('student_sessions');
            file_put_contents($path, "$header\n$row");
            $this->artisan('roster:profiles', ['file' => $path])->assertSuccessful();
            $this->artisan('roster:profiles', ['file' => $path])->assertSuccessful();
            $this->assertDatabaseCount('student_sessions', 1);
            $ada = Student::where('external_student_id', 'DEMO-ADA')->sole();
            $this->assertSame(StudentStatus::Graduated, $ada->status);
            $this->assertSame('alternate@example.test', $ada->source_email);
            $this->assertSame('ada@demo.example.test', $ada->user->email);
            $this->assertCount(2, $ada->enrolments);
        } finally {
            unlink($path);
        }
    }

    public function test_excel_feed_resolves_shared_and_inline_text_without_linking_by_email(): void
    {
        $this->seed(DemoCampusSeeder::class);
        $path = sys_get_temp_dir().'/'.uniqid('profiles').'.xlsx';
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE);
        $zip->addFromString('xl/workbook.xml', '<workbook><sheets><sheet/></sheets></workbook>');
        $zip->addFromString('xl/sharedStrings.xml', '<sst><si><t>student_id</t></si></sst>');
        $header = [
            'student_id',
            'matric_number',
            'name',
            'email',
            'programme',
            'level',
            'session',
            'status',
            'photo',
        ];
        $values = [
            'OTHER',
            'OTHER/1',
            'Demo',
            'ada@demo.example.test',
            'DEMO-BSC',
            '100 (demo)',
            '2026/27 (demo)',
            'active',
        ];
        $sheet = '';
        foreach ([1 => $header, 2 => $values] as $n => $fields) {
            $sheet .= '<row>';
            foreach ($fields as $i => $value) {
                $ref = chr(65 + $i).$n;
                $sheet .=
                    $ref === 'A1'
                        ? '<c r="A1" t="s"><v>0</v></c>'
                        : "<c r=\"$ref\" t=\"inlineStr\"><is><t>$value</t></is></c>";
            }
            $sheet .= '</row>';
        }
        $zip->addFromString(
            'xl/worksheets/sheet1.xml',
            "<worksheet><sheetData>$sheet</sheetData></worksheet>",
        );
        $zip->close();
        try {
            $this->artisan('roster:profiles', ['file' => $path])->assertSuccessful();
            $this->assertDatabaseHas('students', [
                'external_student_id' => 'OTHER',
                'user_id' => null,
                'source_name' => 'Demo',
            ]);
        } finally {
            unlink($path);
        }
    }
}
