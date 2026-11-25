<?php

namespace Tests\Feature\Integrations;

use Firebase\JWT\JWT;
use OpenSSLAsymmetricKey;

final class PartnerKey
{
    public readonly OpenSSLAsymmetricKey $key;

    public function __construct()
    {
        $this->key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    }

    public function jwks(): array
    {
        $rsa = openssl_pkey_get_details($this->key)['rsa'];

        return ['keys' => [['kty' => 'RSA', 'kid' => 'fixture', 'alg' => 'RS256',
            'n' => JWT::urlsafeB64Encode($rsa['n']), 'e' => JWT::urlsafeB64Encode($rsa['e'])]]];
    }
}
