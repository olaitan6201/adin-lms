<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Published result sheet</title>
    <style>{!! file_get_contents(resource_path('css/static/document.css')) !!}</style>
</head>
<body class="font-document text-result text-ink">
    <h1>Published result sheet</h1>
    <p><strong>Learner:</strong> {{ $learner }}</p>
    @if ($course)<p><strong>Course:</strong> {{ $course }}</p>@endif
    <p><strong>Offering:</strong> {{ $offering }}</p>
    <p>Revision {{ $grade->revision }} · Published {{ $grade->published_at->utc()->format('d M Y H:i') }} UTC</p>
    <h2>Final grade: {{ $grade->grade }}</h2>
    <p>Total: {{ $grade->total_percent }}%</p>
    <h2>Assessment breakdown</h2>
    @if ($inputs)
        <table class="w-full table-fixed border-collapse">
            <thead>
                <tr>
                    <th scope="col" class="w-assessment border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">Assessment</th>
                    <th scope="col" class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">Points earned</th>
                    <th scope="col" class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">Maximum</th>
                    <th scope="col" class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">Weight</th>
                </tr>
            </thead>
            <tbody>
            @foreach ($inputs as $input)
                <tr>
                    <td class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">{{ $input['item'] }}</td>
                    <td class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">{{ $input['points'] }}</td>
                    <td class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">{{ $input['maximum'] }}</td>
                    <td class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">{{ $input['weight'] }}%</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @else
        <p>No individual marks were recorded for this revision.</p>
    @endif
</body>
</html>
