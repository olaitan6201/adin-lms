<?php

namespace App\Services\Integrations;

use Firebase\JWT\JWT;
use OpenSSLAsymmetricKey;

final class PlatformSignature
{
    public function issuer(): string
    {
        $issuer = config('integrations.issuer');
        abort_unless(LibraryProfiles::publicLink($issuer), 503);

        return $issuer;
    }

    private function key(): OpenSSLAsymmetricKey
    {
        $file = config('integrations.private_key_file');
        abort_unless(is_string($file) && str_starts_with($file, '/') && is_readable($file) && config('integrations.kid'), 503);
        $key = openssl_pkey_get_private(file_get_contents($file));
        $details = $key ? openssl_pkey_get_details($key) : [];
        abort_unless(($details['type'] ?? null) === OPENSSL_KEYTYPE_RSA && $details['bits'] >= 2048, 503);

        return $key;
    }

    public function sign(array $claims): string
    {
        return JWT::encode($claims, $this->key(), 'RS256', config('integrations.kid'));
    }

    public function jwks(): array
    {
        $rsa = openssl_pkey_get_details($this->key())['rsa'];

        return ['keys' => [['kty' => 'RSA', 'use' => 'sig', 'alg' => 'RS256', 'kid' => config('integrations.kid'),
            'n' => JWT::urlsafeB64Encode($rsa['n']), 'e' => JWT::urlsafeB64Encode($rsa['e'])]]];
    }
}
