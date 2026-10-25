# Builds a searchable index of your screenshots using the built-in Windows OCR (offline).
# Usage: powershell -ExecutionPolicy Bypass -File index-prints.ps1 [-Folder <dir>] [-Out <json>]
# Incremental: images already in the index (same name + size) are skipped.
param(
  [string]$Folder = (Join-Path $env:USERPROFILE "Pictures\Screenshots"),
  [string]$Out = (Join-Path $PSScriptRoot "..\prints-index.json")
)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait(-1) | Out-Null; $task.Result }

$lang = [Windows.Globalization.Language]::new("pt-BR")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }

$index = @{}
if (Test-Path $Out) { (Get-Content $Out -Raw -Encoding UTF8 | ConvertFrom-Json) | ForEach-Object { $index[$_.file] = $_ } }

$files = Get-ChildItem -LiteralPath $Folder -File -Include *.png, *.jpg, *.jpeg -Recurse
$n = 0
foreach ($f in $files) {
  $key = $f.FullName
  if ($index.ContainsKey($key) -and $index[$key].bytes -eq $f.Length) { continue }
  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName); $w = $img.Width; $h = $img.Height; $img.Dispose()
    $sf = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($sf.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $dec = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Await ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    if ($bmp.PixelWidth -gt [Windows.Media.Ocr.OcrEngine]::MaxImageDimension -or $bmp.PixelHeight -gt [Windows.Media.Ocr.OcrEngine]::MaxImageDimension) { $text = "" }
    else { $text = (Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])).Text }
    $stream.Dispose()
  } catch { $text = ""; }
  if ($text.Length -gt 600) { $text = $text.Substring(0, 600) }
  $index[$key] = [pscustomobject]@{ file = $key; name = $f.Name; date = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm"); w = $w; h = $h; bytes = $f.Length; text = $text }
  $n++
}
$index.Values | Sort-Object date -Descending | ConvertTo-Json -Depth 3 | Out-File -FilePath $Out -Encoding utf8
Write-Output "indexed new=$n total=$($index.Count) -> $Out"
