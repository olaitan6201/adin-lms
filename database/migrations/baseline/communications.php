<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('announcements', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->nullable()->constrained('offerings');
    $table->foreignUuid('author_id')->constrained('users');
    $table->text('body');
    $table->timestampTz('published_at')->nullable();
});

Schema::create('forums', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->constrained('offerings');
    $table->foreignUuid('group_id')->nullable()->constrained('study_groups');
    $table->string('title');
});

Schema::create('posts', function (Blueprint $table): void {
    $table->uuid('id');
    $table->primary('id');
    $table->foreignUuid('forum_id')->constrained('forums');
    $table->foreignUuid('parent_id')->nullable()->constrained('posts');
    $table->foreignUuid('author_id')->constrained('users');
    $table->text('body');
    $table->timestampTz('posted_at');
    $table->string('moderation_state');
    $table->index(['forum_id', 'posted_at'], 'posts_forum_id_posted_at_idx');
});

Schema::create('private_messages', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('sender_id')->constrained('users');
    $table->foreignUuid('recipient_id')->constrained('users');
    $table->timestampTz('sent_at');
    $table->text('body');
    $table->index(['recipient_id', 'sent_at'], 'private_messages_recipient_id_sent_at_idx');
});

Schema::create('notifications', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('recipient_id')->constrained('users');
    $table->string('event_key');
    $table->text('body');
    $table->timestampTz('created_at');
    $table->timestampTz('read_at')->nullable();
    $table->unique(['recipient_id', 'event_key'], 'notifications_recipient_event_key_uq');
    $table->index(['recipient_id', 'read_at', 'created_at'], 'notifications_recipient_id_read_at_created_at_idx');
});

Schema::create('notification_deliveries', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('notification_id')->constrained('notifications');
    $table->string('channel');
    $table->string('status');
    $table->timestampTz('next_attempt_at')->nullable();
    $table->integer('attempt_count')->default(0);
    $table->timestampTz('delivered_at')->nullable();
    $table->string('last_error_code')->nullable();
    $table->unique(['notification_id', 'channel'], 'notification_deliveries_notification_channel_uq');
    $table->index(['status', 'next_attempt_at'], 'notification_deliveries_status_next_attempt_at_idx');
});
