<?php

namespace App\Models;

use App\Notifications\AccountResetLink;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['full_name', 'email', 'password_hash'])]
#[Hidden(['password_hash', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUuids, Notifiable;

    public static function canonicalEmail(string $email): string
    {
        return Str::lower(trim($email));
    }

    protected function email(): Attribute
    {
        return Attribute::set(fn (string $value): string => self::canonicalEmail($value));
    }

    public function sendPasswordResetNotification(mixed $token): void
    {
        $this->notify(new AccountResetLink($token));
    }

    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(File::class, 'photo_id');
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function lecturer(): HasOne
    {
        return $this->hasOne(Lecturer::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'auth_version' => 'integer',
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }
}
