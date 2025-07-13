param(
    [string]$Version,
    [string]$Notas,
    [string]$ExePath
)

if (-not $Version -or -not $Notas -or -not $ExePath) {
    Write-Host "Uso: .\auto_update_release.ps1 <version> <notas> <ruta_a_exe>"
    exit 1
}

$ExeName = Split-Path $ExePath -Leaf
$Fecha = Get-Date -Format "yyyy-MM-dd"

# Crear la release y subir el ejecutable
gh release create "v$Version" $ExePath --title "v$Version" --notes "$Notas"

# Enlace de descarga directo
$ExeUrl = "https://github.com/VictorGugug/ROAFK-UPTADES/releases/download/v$Version/$ExeName"

# Crear/actualizar latest.json
@"
{
  "version": "$Version",
  "date": "$Fecha",
  "notes": "$Notas",
  "url": "$ExeUrl"
}
"@ | Set-Content -Encoding UTF8 latest.json

# Subir cambios a GitHub
git add latest.json
git commit -m "Actualización a versión $Version"
git push

Write-Host "¡Todo listo! La web y el programa se actualizarán automáticamente."
Write-Host "Enlace de descarga: $ExeUrl"
