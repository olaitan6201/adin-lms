<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Published result sheet</title>
    <style>
        body { font: 11pt "DejaVu Sans", sans-serif; color: #172b32; }
        h1 { font-size: 20pt; }
        h2 { margin-top: 24pt; font-size: 14pt; }
        table { border-collapse: collapse; width: 100%; table-layout: fixed; }
        th, td { padding: 6pt; border-bottom: 1px solid #ccc; text-align: left; overflow-wrap: break-word; }
        th:first-child { width: 43%; }
    </style>
</head>
<body>
    <h1>Published result sheet</h1>
    <p><strong>Learner:</strong> {{ $learner }}</p>
    @if ($course)<p><strong>Course:</strong> {{ $course }}</p>@endif
    <p><strong>Offering:</strong> {{ $offering }}</p>
    <p>Revision {{ $grade->revision }} · Published {{ $grade->published_at->utc()->format('d M Y H:i') }} UTC</p>
    <h2>Final grade: {{ $grade->grade }}</h2>
    <p>Total: {{ $grade->total_percent }}%</p>
    <h2>Assessment breakdown</h2>
    @if ($inputs)
        <table>
            <thead><tr><th>Assessment</th><th>Points earned</th><th>Maximum</th><th>Weight</th></tr></thead>
            <tbody>
            @foreach ($inputs as $input)
                <tr>
                    <td>{{ $input['item'] }}</td><td>{{ $input['points'] }}</td>
                    <td>{{ $input['maximum'] }}</td><td>{{ $input['weight'] }}%</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @else
        <p>No individual marks were recorded for this revision.</p>
    @endif
</body>
</html>
