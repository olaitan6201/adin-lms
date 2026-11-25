<?php

namespace App\Services\Integrations;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

final class BrowserTransactions
{
    public function issue(Request $request, string $kind, array $data): string
    {
        $browser = $request->session()->get('integrations.browser') ?? Str::random(64);
        $request->session()->put('integrations.browser', $browser);
        $ticket = Str::random(64);
        Cache::put($this->key($kind, $ticket, $browser), $data, 180);

        return $ticket;
    }

    public function consume(Request $request, string $kind, mixed $ticket): array
    {
        abort_unless(is_string($ticket) && strlen($ticket) === 64, 403);
        $key = $this->key($kind, $ticket, (string) $request->session()->get('integrations.browser'));
        $transaction = Cache::lock($key.':lock', 10)->get(fn () => Cache::pull($key));
        abort_unless(is_array($transaction), 403);

        return $transaction;
    }

    private function key(string $kind, string $ticket, string $browser): string
    {
        return 'integrations:'.$kind.':'.hash('sha256', $ticket.':'.$browser);
    }
}
