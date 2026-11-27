import { StatTile } from '@/components/ui/data-display/StatTile';
import { Sparkline } from './Charts';

type Tile = {
    label: string;
    value: string | null;
    delta?: string;
    deltaLabel: string;
    icon: string;
    spark?: Parameters<typeof Sparkline>[0];
};

export function Tiles({ items }: { items: readonly Tile[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 [&_.kpi-label]:text-ink-500">
            {items.map(({ spark, value, deltaLabel, ...tile }) => (
                <StatTile
                    key={tile.label}
                    {...tile}
                    value={value ?? <span className="text-base text-ink-600">Not available</span>}
                    deltaLabel={deltaLabel && <span className="text-ink-500">{deltaLabel}</span>}
                >
                    {spark && <Sparkline {...spark} />}
                </StatTile>
            ))}
        </div>
    );
}
