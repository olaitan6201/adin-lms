<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin/overview')->name('home');
Route::inertia('/portal', 'Portal/Home')->name('portal.home');

require __DIR__.'/web/academics.php';
require __DIR__.'/web/assessments.php';
require __DIR__.'/web/community.php';
require __DIR__.'/web/guardian.php';
require __DIR__.'/web/identity.php';
require __DIR__.'/web/insights.php';
require __DIR__.'/web/integrations.php';
require __DIR__.'/web/learning.php';
require __DIR__.'/web/operations.php';
require __DIR__.'/web/people.php';
require __DIR__.'/web/workspaces.php';
