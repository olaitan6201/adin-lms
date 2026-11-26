import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export type CriterionScore = {
    criterion_title: string;
    level_label: string;
    points: string;
    feedback: string | null;
};

export function CriterionFeedback({ scores }: { scores: CriterionScore[] }) {
    if (!scores.length) {
        return null;
    }
    return (
        <Table aria-label="Criterion marks">
            <TableCaption>Criterion marks and feedback</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead scope="col">Criterion</TableHead>
                    <TableHead scope="col">Level</TableHead>
                    <TableHead scope="col">Points</TableHead>
                    <TableHead scope="col">Feedback</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {scores.map((score, index) => (
                    <TableRow key={index}>
                        <TableHead scope="row">{score.criterion_title}</TableHead>
                        <TableCell>{score.level_label}</TableCell>
                        <TableCell>{score.points}</TableCell>
                        <TableCell className="whitespace-normal">{score.feedback ?? '—'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
