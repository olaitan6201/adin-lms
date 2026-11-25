<?php

return [
    'libraries' => json_decode((string) env('INTEGRATIONS_LIBRARIES_JSON', '{}'), true, 16, JSON_THROW_ON_ERROR),
];
