<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;

final readonly class PlacementDeskLocation
{
    private const int MAX_PAGE = 10000;

    private function __construct(public int $page) {}

    public static function fromRequest(Request $request): self
    {
        $page = filter_var($request->query('page'), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => self::MAX_PAGE],
        ]);

        return new self($page === false ? 1 : $page);
    }

    public function urlFor(string $action = 'index', ?string $update = null, ?int $page = null): string
    {
        $page ??= $this->page;
        $parameters = [];
        if ($update !== null) {
            $parameters['update'] = $update;
        }

        if ($page > 1) {
            $parameters['page'] = $page;
        }

        return route("admin.placements.$action", $parameters, absolute: false);
    }

    public function previousUrl(?string $update): ?string
    {
        return $this->page > 1 ? $this->urlFor(update: $update, page: $this->page - 1) : null;
    }

    public function nextUrl(bool $hasMorePages, ?string $update): ?string
    {
        return $hasMorePages && $this->page < self::MAX_PAGE
            ? $this->urlFor(update: $update, page: $this->page + 1)
            : null;
    }
}
