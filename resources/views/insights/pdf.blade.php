<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Academic report</title>
<style>body{font-family:DejaVu Sans,sans-serif;font-size:9pt}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{padding:5px;text-align:left;vertical-align:top;border-bottom:1px solid #bbb;overflow-wrap:break-word}th{background:#e9efee}</style>
</head><body><h1>Academic report</h1><table>
<thead><tr>@foreach ($table::COLUMNS as $label)<th>{{ $label }}</th>@endforeach</tr></thead>
<tbody>
@foreach ($table->lines() as $row)
    @unless($loop->first)
        <tr>
            @foreach ($row as $value)
                <td>{{ $value }}</td>
            @endforeach
        </tr>
    @endunless
@endforeach
</tbody>
</table></body></html>
