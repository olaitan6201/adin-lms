<?php

namespace App\Models;

class StudentPhoto extends DomainModel
{
    public $timestamps = false;

    protected $hidden = ['jpeg_base64'];
}
