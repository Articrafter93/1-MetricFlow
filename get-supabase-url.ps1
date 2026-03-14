$token = Read-Host -Prompt "Pega tu Token de Supabase aquí"
Write-Host "Consultando proyectos..."; $headers = @{ Authorization = "Bearer $token" }; try { $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects" -Headers $headers -ErrorAction Stop; $response | Select-Object id, name, region } catch { Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red }
