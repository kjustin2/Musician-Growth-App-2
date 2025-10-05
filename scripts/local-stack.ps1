# Mode B Local Stack Management Script for Windows
# Handles starting, stopping, and managing the full local testing environment

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "status", "restart", "reset", "logs", "health")]
    [string]$Action
)

# Configuration
$SUPABASE_PORT = 54321
$MOCK_PORTS = @(8080, 8081, 8082, 8083, 8084, 8085)
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Port {
    param([int]$Port)
    $tcpConnection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $tcpConnection.TcpTestSucceeded
}

function Wait-ForPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 30,
        [string]$ServiceName = "Service"
    )
    
    Write-ColorOutput "⏳ Waiting for $ServiceName on port $Port..." "Yellow"
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    do {
        if (Test-Port -Port $Port) {
            Write-ColorOutput "✅ $ServiceName is ready on port $Port" "Green"
            return $true
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $timeout)
    
    Write-ColorOutput "❌ $ServiceName failed to start within $TimeoutSeconds seconds" "Red"
    return $false
}

function Start-LocalStack {
    Write-ColorOutput "🚀 Starting Mode B Local Stack..." "Cyan"
    
    # Check if services are already running
    $runningServices = @()
    if (Test-Port -Port $SUPABASE_PORT) { $runningServices += "Supabase" }
    if (Test-Port -Port 8080) { $runningServices += "Mock APIs" }
    
    if ($runningServices.Count -gt 0) {
        Write-ColorOutput "⚠️  Some services are already running: $($runningServices -join ', ')" "Yellow"
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne 'y' -and $continue -ne 'Y') {
            Write-ColorOutput "❌ Cancelled" "Red"
            return
        }
    }
    
    # Start Supabase
    Write-ColorOutput "📦 Starting Supabase local instance..." "Blue"
    Set-Location $PROJECT_ROOT
    $supabaseProcess = Start-Process -FilePath "npx" -ArgumentList "supabase", "start" -NoNewWindow -PassThru
    
    if (-not (Wait-ForPort -Port $SUPABASE_PORT -TimeoutSeconds 60 -ServiceName "Supabase")) {
        Write-ColorOutput "❌ Failed to start Supabase" "Red"
        return
    }
    
    # Start Mock APIs
    Write-ColorOutput "🎭 Starting mock API servers..." "Blue"
    $mockProcess = Start-Process -FilePath "node" -ArgumentList "$PROJECT_ROOT/mocks/server.cjs" -NoNewWindow -PassThru
    
    if (-not (Wait-ForPort -Port 8080 -TimeoutSeconds 30 -ServiceName "Mock APIs")) {
        Write-ColorOutput "❌ Failed to start Mock APIs" "Red"
        return
    }
    
    # Verify all services
    Write-ColorOutput "🔍 Verifying all services..." "Blue"
    $allHealthy = $true
    
    # Check Supabase
    if (Test-Port -Port $SUPABASE_PORT) {
        Write-ColorOutput "✅ Supabase: http://localhost:$SUPABASE_PORT" "Green"
    } else {
        Write-ColorOutput "❌ Supabase: Not responding" "Red"
        $allHealthy = $false
    }
    
    # Check Studio
    if (Test-Port -Port 54323) {
        Write-ColorOutput "✅ Supabase Studio: http://localhost:54323" "Green"
    } else {
        Write-ColorOutput "❌ Supabase Studio: Not responding" "Red"
    }
    
    # Check Mock APIs
    foreach ($port in $MOCK_PORTS) {
        $serviceName = switch ($port) {
            8080 { "Combined Mock APIs" }
            8081 { "OpenWeather Mock" }
            8082 { "Spotify Mock" }
            8083 { "Google Calendar Mock" }
            8084 { "OpenRouter Mock" }
            8085 { "Mapbox Mock" }
        }
        
        if (Test-Port -Port $port) {
            Write-ColorOutput "✅ $serviceName`: http://localhost:$port" "Green"
        } else {
            Write-ColorOutput "❌ $serviceName`: Not responding" "Red"
            if ($port -ne 8080) { $allHealthy = $false }
        }
    }
    
    if ($allHealthy) {
        Write-ColorOutput "`n🎉 Mode B Local Stack is ready!" "Green"
        Write-ColorOutput "🌐 You can now run: npm run dev:mock" "Cyan"
        Write-ColorOutput "🔧 Health dashboard: http://localhost:5173/dev/health" "Cyan"
        Write-ColorOutput "🗄️  Database Studio: http://localhost:54323" "Cyan"
    } else {
        Write-ColorOutput "`n⚠️  Some services may not be fully healthy. Check the logs." "Yellow"
    }
}

function Stop-LocalStack {
    Write-ColorOutput "🛑 Stopping Mode B Local Stack..." "Red"
    
    # Stop Supabase
    Write-ColorOutput "📦 Stopping Supabase..." "Blue"
    Set-Location $PROJECT_ROOT
    Start-Process -FilePath "npx" -ArgumentList "supabase", "stop" -NoNewWindow -Wait
    
    # Stop Mock APIs (kill all node processes that might be our mock servers)
    Write-ColorOutput "🎭 Stopping mock API servers..." "Blue"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($process in $nodeProcesses) {
        try {
            $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
            if ($cmdLine -like "*mocks/server.cjs*") {
                Write-ColorOutput "🔄 Stopping mock server (PID: $($process.Id))" "Yellow"
                $process.Kill()
            }
        } catch {
            # Ignore errors when checking command line
        }
    }
    
    Start-Sleep -Seconds 2
    Write-ColorOutput "✅ Local stack stopped" "Green"
}

function Get-StackStatus {
    Write-ColorOutput "📊 Mode B Local Stack Status" "Cyan"
    Write-ColorOutput "=" * 40 "Gray"
    
    # Check Supabase
    if (Test-Port -Port $SUPABASE_PORT) {
        Write-ColorOutput "🟢 Supabase API: Running (http://localhost:$SUPABASE_PORT)" "Green"
    } else {
        Write-ColorOutput "🔴 Supabase API: Not running" "Red"
    }
    
    if (Test-Port -Port 54323) {
        Write-ColorOutput "🟢 Supabase Studio: Running (http://localhost:54323)" "Green"
    } else {
        Write-ColorOutput "🔴 Supabase Studio: Not running" "Red"
    }
    
    # Check Mock APIs
    foreach ($port in $MOCK_PORTS) {
        $serviceName = switch ($port) {
            8080 { "Combined Mock APIs" }
            8081 { "OpenWeather Mock" }
            8082 { "Spotify Mock" }
            8083 { "Google Calendar Mock" }
            8084 { "OpenRouter Mock" }
            8085 { "Mapbox Mock" }
        }
        
        if (Test-Port -Port $port) {
            Write-ColorOutput "🟢 $serviceName`: Running (http://localhost:$port)" "Green"
        } else {
            Write-ColorOutput "🔴 $serviceName`: Not running" "Red"
        }
    }
    
    Write-ColorOutput "`n💡 Commands:" "Cyan"
    Write-ColorOutput "  • Start: scripts/local-stack.ps1 start" "White"
    Write-ColorOutput "  • Stop:  scripts/local-stack.ps1 stop" "White"
    Write-ColorOutput "  • Dev:   npm run dev:mock" "White"
}

function Reset-LocalDatabase {
    Write-ColorOutput "🔄 Resetting local database..." "Yellow"
    
    Set-Location $PROJECT_ROOT
    $resetProcess = Start-Process -FilePath "npx" -ArgumentList "supabase", "db", "reset" -NoNewWindow -PassThru -Wait
    
    if ($resetProcess.ExitCode -eq 0) {
        Write-ColorOutput "✅ Database reset complete" "Green"
        Write-ColorOutput "📊 Seed data has been reloaded" "Blue"
    } else {
        Write-ColorOutput "❌ Database reset failed" "Red"
    }
}

function Show-Logs {
    Write-ColorOutput "📋 Local Stack Logs" "Cyan"
    Write-ColorOutput "=" * 30 "Gray"
    
    Write-ColorOutput "🗄️  For Supabase logs, run: npx supabase logs" "Blue"
    Write-ColorOutput "🎭 Mock API servers log to console where they were started" "Blue"
    Write-ColorOutput "🔍 Check browser console for client-side logs" "Blue"
    
    # Try to show recent Supabase logs
    Set-Location $PROJECT_ROOT
    Start-Process -FilePath "npx" -ArgumentList "supabase", "logs" -NoNewWindow -Wait
}

function Test-StackHealth {
    Write-ColorOutput "🏥 Running health checks..." "Cyan"
    
    $healthyServices = 0
    $totalServices = 6
    
    # Test each service with HTTP requests
    $services = @(
        @{ Name = "Supabase"; Url = "http://localhost:$SUPABASE_PORT/health"; Required = $true },
        @{ Name = "Mock APIs Health"; Url = "http://localhost:8080/health"; Required = $true },
        @{ Name = "OpenWeather Mock"; Url = "http://localhost:8081/health"; Required = $false },
        @{ Name = "Spotify Mock"; Url = "http://localhost:8082/health"; Required = $false },
        @{ Name = "Google Calendar Mock"; Url = "http://localhost:8083/health"; Required = $false },
        @{ Name = "OpenRouter Mock"; Url = "http://localhost:8084/health"; Required = $false },
        @{ Name = "Mapbox Mock"; Url = "http://localhost:8085/health"; Required = $false }
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "✅ $($service.Name): Healthy" "Green"
                $healthyServices++
            } else {
                Write-ColorOutput "⚠️  $($service.Name): Responded with status $($response.StatusCode)" "Yellow"
                if ($service.Required) { $healthyServices++ }
            }
        } catch {
            if ($service.Required) {
                Write-ColorOutput "❌ $($service.Name): Not responding" "Red"
            } else {
                Write-ColorOutput "⚠️  $($service.Name): Not responding (optional)" "Yellow"
                $healthyServices++
            }
        }
    }
    
    Write-ColorOutput "`n📊 Health Summary: $healthyServices/$totalServices services healthy" "Cyan"
    
    if ($healthyServices -eq $totalServices) {
        Write-ColorOutput "🎉 All systems operational!" "Green"
    } elseif ($healthyServices -ge ($totalServices - 1)) {
        Write-ColorOutput "⚠️  Mostly healthy - some optional services may be down" "Yellow"
    } else {
        Write-ColorOutput "❌ Multiple services are unhealthy" "Red"
    }
}

# Main execution
switch ($Action) {
    "start" { Start-LocalStack }
    "stop" { Stop-LocalStack }
    "status" { Get-StackStatus }
    "restart" { 
        Stop-LocalStack
        Start-Sleep -Seconds 3
        Start-LocalStack
    }
    "reset" { Reset-LocalDatabase }
    "logs" { Show-Logs }
    "health" { Test-StackHealth }
    default { 
        Write-ColorOutput "❌ Unknown action: $Action" "Red"
        Write-ColorOutput "Available actions: start, stop, status, restart, reset, logs, health" "White"
    }
}