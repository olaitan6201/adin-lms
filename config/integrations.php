<?php

return [
    'libraries' => json_decode((string) env('INTEGRATIONS_LIBRARIES_JSON', '{}'), true, 16, JSON_THROW_ON_ERROR),
    'tools' => json_decode((string) env('INTEGRATIONS_TOOLS_JSON', '{}'), true, 16, JSON_THROW_ON_ERROR),
    'issuer' => env('LTI_PLATFORM_ISSUER'),
    'private_key_file' => env('LTI_PRIVATE_KEY_FILE'),
    'kid' => env('LTI_KEY_ID'),
    'oidc' => json_decode((string) env('INSTITUTION_OIDC_JSON', '{}'), true, 16, JSON_THROW_ON_ERROR),
    'oidc_secret' => env('INSTITUTION_OIDC_SECRET'),
];
