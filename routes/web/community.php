<?php

use App\Http\Controllers\Community\BoardController;
use App\Http\Controllers\Community\DeliveryRecoveryController;
use App\Http\Controllers\Community\DiscussionController;
use App\Http\Controllers\Community\InboxController;
use App\Http\Controllers\Community\StudyGroupController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')
    ->prefix('community')
    ->name('community.')
    ->group(function (): void {
        Route::get('/', [InboxController::class, 'index'])->name('inbox');
        Route::get('/delivery-failures', [DeliveryRecoveryController::class, 'index'])->name('delivery.failures');
        Route::post('/delivery-failures/{delivery}', [DeliveryRecoveryController::class, 'retry'])
            ->whereUuid('delivery')->name('delivery.retry');
        Route::post('/announcements', [InboxController::class, 'announce'])->name('institution.announce');
        Route::patch('/notifications/{notice}', [InboxController::class, 'readState'])
            ->whereUuid('notice')
            ->name('notifications.read');
        Route::prefix('courses/{offering}')
            ->whereUuid('offering')
            ->group(function (): void {
                Route::get('/', [BoardController::class, 'show'])->name('board');
                Route::post('/groups', [StudyGroupController::class, 'save'])->name('groups.create');
                Route::post('/groups/{group}', [StudyGroupController::class, 'save'])->whereUuid('group')->name('groups.update');
                Route::post('/forums', [BoardController::class, 'forum'])->name('forums.create');
                Route::post('/announcements', [BoardController::class, 'announce'])->name('course.announce');
                Route::post('/messages', [BoardController::class, 'message'])
                    ->middleware('throttle:30,1')
                    ->name('message');
            });
        Route::prefix('forums/{forum}')
            ->whereUuid('forum')
            ->group(function (): void {
                Route::get('/', [DiscussionController::class, 'show'])
                    ->can('view', 'forum')
                    ->name('discussion');
                Route::post('/posts', [DiscussionController::class, 'store'])
                    ->can('view', 'forum')
                    ->name('post');
                Route::patch('/posts/{post}/hide', [DiscussionController::class, 'hide'])
                    ->whereUuid('post')
                    ->can('moderate', 'forum')
                    ->name('hide');
            });
    });
