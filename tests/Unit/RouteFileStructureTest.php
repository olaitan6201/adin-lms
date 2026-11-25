<?php

namespace Tests\Unit;

use PhpParser\Node\Stmt\Declare_;
use PhpParser\Node\Stmt\GroupUse;
use PhpParser\Node\Stmt\Use_;
use PhpParser\ParserFactory;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class RouteFileStructureTest extends TestCase
{
    public static function routeFiles(): iterable
    {
        $directory = dirname(__DIR__, 2).'/routes';

        foreach (glob($directory.'/{*,web/*}.php', GLOB_BRACE) as $path) {
            yield basename($path) => [$path];
        }
    }

    #[DataProvider('routeFiles')]
    public function test_imports_precede_route_registration(string $path): void
    {
        $parser = (new ParserFactory)->createForHostVersion();
        $statements = $parser->parse(file_get_contents($path));
        $this->assertNotNull($statements);
        $registrationStarted = false;

        foreach ($statements as $statement) {
            if ($statement instanceof Declare_) {
                continue;
            }

            if ($statement instanceof Use_ || $statement instanceof GroupUse) {
                $this->assertFalse($registrationStarted, "{$path}:{$statement->getStartLine()} — move import to the header.");

                continue;
            }

            $registrationStarted = true;
        }
    }
}
