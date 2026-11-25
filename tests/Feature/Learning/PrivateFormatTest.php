<?php

namespace Tests\Feature\Learning;

use App\Models\LearningMaterial;
use App\Models\Module;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Page;
use ZipArchive;

class PrivateFormatTest extends LearningTestCase
{
    public function test_office_archive_image_and_pdf_resources_survive_private_delivery(): void
    {
        Storage::fake('academic');
        $module = Module::whereOfferingId($this->offering->id)->sole();
        $url = route('learning.revisions.store', [$this->offering, $module]);
        $zip = UploadedFile::fake()->create('draft.zip');
        $archive = new ZipArchive;
        $archive->open($zip->getRealPath(), ZipArchive::OVERWRITE);
        $archive->addFromString('[Content_Types].xml', '<Types/>');
        $archive->addFromString('word/document.xml', '<document/>');
        $archive->close();
        $bytes = file_get_contents($zip->getRealPath());
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF70AAAAASUVORK5CYII=',
        );
        $this->actingAs($this->teacher);
        foreach (
            [
                'exercise.zip' => $bytes,
                'paper.docx' => $bytes,
                'figure.png' => $png,
                'slides.pdf' => "%PDF-1.7\n%%EOF\n",
            ] as $name => $content
        ) {
            $this->post($url, [
                'title' => $name,
                'download_allowed' => true,
                'file' => UploadedFile::fake()->createWithContent($name, $content),
            ])
                ->assertSessionHasNoErrors()
                ->assertRedirect();
        }

        $this->post($url, [
            'title' => 'wrong',
            'download_allowed' => true,
            'file' => UploadedFile::fake()->createWithContent('wrong.xlsx', $bytes),
        ])->assertSessionHasErrors('file');
        $figure = LearningMaterial::whereTitle('figure.png')->sole();
        $page = $this->actingAs($this->learner)
            ->get($this->base)
            ->assertInertia(fn (Page $p) => $p->has('lessons.0.materials', 5));
        $materials = collect($page->viewData('page')['props']['lessons'][0]['materials']);
        $image = $materials->firstWhere('id', $figure->id)['versions'][0]['image'];
        $this->assertSame(
            $png,
            $this->get($image)->assertHeader('Content-Type', 'image/png')->streamedContent(),
        );
        $module->forceFill(['closes_at' => now()->subMinute()])->save();
        $this->get($image)->assertNotFound();
    }
}
