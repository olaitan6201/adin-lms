<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class CommunityNoticeMail extends Mailable
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New LMS notification');
    }

    public function content(): Content
    {
        return new Content(text: 'mail.community-notice');
    }
}
