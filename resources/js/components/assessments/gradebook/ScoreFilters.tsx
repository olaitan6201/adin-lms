import { Action } from '@/components/ui/controls/Action';
import { stages } from './Moderation';

export function ScoreFilters({
    state,
    tool,
    search,
    filter,
    setTool,
    find,
}: {
    state: string;
    tool: string;
    search: string;
    filter: (value: string) => void;
    setTool: (value: string) => void;
    find: (value: string) => void;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            <Action size="sm" icon="filter" onClick={() => setTool(tool === 'state' ? '' : 'state')}>
                {stages.find(([id]) => id === state)?.[1] ?? 'All states'}
            </Action>
            <Action size="sm" icon="search" onClick={() => setTool(tool === 'search' ? '' : 'search')}>
                Find student
            </Action>
            {tool === 'state' && (
                <select
                    className="select"
                    aria-label="Filter by state"
                    value={state}
                    onChange={(e) => filter(e.target.value)}
                >
                    <option value="">All states</option>
                    {stages.map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            )}
            {tool === 'search' && (
                <input
                    autoFocus
                    className="input"
                    aria-label="Find student"
                    placeholder="Find student"
                    value={search}
                    onChange={(e) => find(e.target.value)}
                />
            )}
            <small className="ml-auto text-xs text-ink-400">
                Score changes are saved locally and recalculate the recorded grade
            </small>
        </div>
    );
}
