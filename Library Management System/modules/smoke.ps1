$ErrorActionPreference = 'Stop'
$base = 'http://localhost:9090/library'
$ts = (Get-Date).ToString('HHmmssfff')
$newTag = "TEST-CRUD-$ts"

function Hit {
    param($method, $url, $body = $null)
    $params = @{
        Uri             = $base + $url
        Method          = $method
        Headers         = @{ 'Content-Type' = 'application/json' }
        UseBasicParsing = $true
        TimeoutSec      = 5
    }
    if ($null -ne $body) { $params['Body'] = $body }
    try {
        $r = Invoke-WebRequest @params
        return @{ ok = $true; code = $r.StatusCode; body = $r.Content }
    } catch {
        $resp = $_.Exception.Response
        $code = if ($resp) { [int]$resp.StatusCode } else { 0 }
        $body = ''
        if ($resp) {
            $stream = $resp.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
        }
        return @{ ok = $false; code = $code; body = $body }
    }
}

$body = @{
    assetTag = $newTag
    name = 'x'
    description = 'x'
    institution = 'x'
    site = 'x'
    dateAcquired = '2024-01-15'
    components = @()
    schedules = @()
    workOrders = @()
} | ConvertTo-Json -Compress

$sched = @{
    scheduleId = "SCH-X-$ts"
    type = 'MAINTENANCE'
    dueDate = '2026-12-31'
    description = 'future'
} | ConvertTo-Json -Compress

$wo = @{
    orderId = "WO-X-$ts"
    status = 'OPEN'
    description = 'd'
    tasks = @(@{ taskId = 'T1'; description = 'a'; completed = $false })
} | ConvertTo-Json -Compress

$tests = @(
    @{ name = 'CREATE';        m = 'POST';   u = '/assets';                                  b = $body;  exp = 201 },
    @{ name = 'DUP';           m = 'POST';   u = '/assets';                                  b = $body;  exp = 409 },
    @{ name = 'GET-ONE';       m = 'GET';    u = "/assets/$newTag";                          exp = 200 },
    @{ name = 'UPDATE';        m = 'PUT';    u = "/assets/$newTag";                          b = '{"name":"renamed"}'; exp = 200 },
    @{ name = 'ADD-COMP';      m = 'POST';   u = "/assets/$newTag/components";               b = '{"compId":"C-X","name":"n","description":"d"}'; exp = 201 },
    @{ name = 'DUP-COMP';      m = 'POST';   u = "/assets/$newTag/components";               b = '{"compId":"C-X","name":"n","description":"d"}'; exp = 409 },
    @{ name = 'ADD-SCHED';     m = 'POST';   u = "/assets/$newTag/schedules";                b = $sched; exp = 201 },
    @{ name = 'BAD-DATE';      m = 'POST';   u = "/assets/$newTag/schedules";                b = '{"scheduleId":"X","type":"MAINTENANCE","dueDate":"nope","description":"d"}'; exp = 400 },
    @{ name = 'ADD-WO';        m = 'POST';   u = "/assets/$newTag/workorders";               b = $wo;    exp = 201 },
    @{ name = 'ADD-TASK';      m = 'POST';   u = "/assets/$newTag/workorders/WO-X-$ts/tasks";b = '{"taskId":"T2","description":"b","completed":false}'; exp = 201 },
    @{ name = 'UPDATE-WO';     m = 'PUT';    u = "/assets/$newTag/workorders/WO-X-$ts";      b = '{"status":"IN_PROGRESS"}'; exp = 200 },
    @{ name = 'LOAN-FAIL';     m = 'POST';   u = "/assets/$newTag/loan";                     b = '{"borrower":"A","expectedReturnDate":"2026-09-30"}'; exp = 409 },
    @{ name = 'SET-AVAIL';     m = 'PUT';    u = "/assets/$newTag";                          b = '{"status":"AVAILABLE"}'; exp = 200 },
    @{ name = 'LOAN-OK';       m = 'POST';   u = "/assets/$newTag/loan";                     b = '{"borrower":"A","expectedReturnDate":"2026-09-30"}'; exp = 201 },
    @{ name = 'CHECKIN';       m = 'POST';   u = "/assets/$newTag/checkin";                  b = '{}';   exp = 201 },
    @{ name = 'BOOK';          m = 'POST';   u = "/assets/$newTag/book";                     b = '{"bookedBy":"Dr X","scheduledDate":"2026-10-15","purpose":"Exam"}'; exp = 201 },
    @{ name = 'BOOK-DUP';      m = 'POST';   u = "/assets/$newTag/book";                     b = '{"bookedBy":"Dr Y","scheduledDate":"2026-10-15","purpose":"X"}'; exp = 409 },
    @{ name = 'DEL-COMP';      m = 'DELETE'; u = "/assets/$newTag/components/C-X";           exp = 200 },
    @{ name = 'DEL-COMP-404';  m = 'DELETE'; u = "/assets/$newTag/components/C-X";           exp = 404 },
    @{ name = 'DEL-SCHED';     m = 'DELETE'; u = "/assets/$newTag/schedules/SCH-X-$ts";      exp = 200 },
    @{ name = 'DEL-WO';        m = 'DELETE'; u = "/assets/$newTag/workorders/WO-X-$ts";      exp = 200 },
    @{ name = 'DEL-ASSET';     m = 'DELETE'; u = "/assets/$newTag";                          exp = 200 },
    @{ name = 'DEL-ASSET-404'; m = 'DELETE'; u = "/assets/$newTag";                          exp = 404 },
    @{ name = 'OVERDUE';       m = 'GET';    u = '/maintenance/overdue';                     exp = 200 },
    @{ name = 'BY-INST';       m = 'GET';    u = '/institutions/University%20of%20Namibia/assets'; exp = 200 },
    @{ name = 'BY-SITE';       m = 'GET';    u = '/sites/Main%20Campus%20-%20Library/assets'; exp = 200 }
)

$failed = 0
foreach ($t in $tests) {
    $r = Hit $t.m $t.u $t.b
    $ok = $r.code -eq $t.exp
    $marker = if ($ok) { '✓' } else { '✗' }
    Write-Output ("$marker {0,-15} {1,-7} {2,-3} expect={3}" -f $t.name, $t.m, $r.code, $t.exp)
    if (-not $ok) {
        $failed++
        Write-Output ('  body: ' + ($r.body.Substring(0, [Math]::Min(200, $r.body.Length))))
    }
}
Write-Output ''
Write-Output ("Failed: $failed / $($tests.Count)")
