<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Academic report</title>
    <style>{!! file_get_contents(resource_path('css/static/document.css')) !!}</style>
</head>
<body class="font-document text-report text-ink">
    <h1>Academic report</h1>
    <table class="w-full table-fixed border-collapse">
        <thead>
            <tr>
                @foreach ($table->columns as $label)
                    <th scope="col" class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">{{ $label }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach ($table->lines() as $row)
                @unless ($loop->first)
                    <tr>
                        @foreach ($row as $value)
                            <td class="border-0 border-b border-solid border-rule p-cell text-left align-top wrap-break-word">{{ $value }}</td>
                        @endforeach
                    </tr>
                @endunless
            @endforeach
        </tbody>
    </table>
</body>
</html>
