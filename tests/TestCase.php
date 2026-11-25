<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Kernel tests exercise real HTTP, database and Inertia props. Built
        // asset delivery is exercised separately by the Playwright suite.
        $this->withoutVite();
    }
}
