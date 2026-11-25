<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use LogicException;

trait AppendOnly
{
    protected static function bootAppendOnly(): void
    {
        static::updating(function (Model $record): void {
            throw new LogicException(static::class.' records are immutable.');
        });

        static::deleting(function (Model $record): void {
            throw new LogicException(static::class.' records are immutable.');
        });
    }
}
