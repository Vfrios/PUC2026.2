# =============================================================
# Reviva — script para popular o banco com 3 contas completas
# =============================================================
# Pré-requisito: o backend precisa estar RODANDO antes de executar
# este script (mvn spring-boot:run), escutando em localhost:8080.
#
# Como usar:
#   1. Num terminal, dentro de reviva-api: mvn spring-boot:run
#   2. Espere aparecer "Started RevivaApiApplication"
#   3. Noutro terminal (não fecha o primeiro!), rode este script:
#      .\seed-completo.ps1
# =============================================================

$BASE = "http://localhost:8080"

function Post($path, $body, $token = $null) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    return Invoke-RestMethod -Uri "$BASE$path" -Method Post -Headers $headers -Body ($body | ConvertTo-Json -Depth 5)
}

Write-Host "Criando 3 contas..." -ForegroundColor Cyan

# ---- 1. Registro das 3 contas ----
$contas = @(
    @{ nome = "Marina Souza";    email = "marina@reviva.com";  senha = "reviva123" },
    @{ nome = "Carlos Teixeira"; email = "carlos@reviva.com";  senha = "reviva123" },
    @{ nome = "Beatriz Lima";    email = "beatriz@reviva.com"; senha = "reviva123" }
)

$tokens = @{}
foreach ($c in $contas) {
    try {
        $resp = Post "/api/auth/registrar" $c
        $tokens[$c.email] = $resp.token
        Write-Host "  Criada: $($c.email)" -ForegroundColor Green
    } catch {
        # Se já existir (rodou o script antes), só faz login pra pegar o token
        $resp = Post "/api/auth/login" @{ email = $c.email; senha = $c.senha }
        $tokens[$c.email] = $resp.token
        Write-Host "  Já existia, login OK: $($c.email)" -ForegroundColor Yellow
    }
}

$tMarina  = $tokens["marina@reviva.com"]
$tCarlos  = $tokens["carlos@reviva.com"]
$tBeatriz = $tokens["beatriz@reviva.com"]

function AuthHeader($token) { @{ Authorization = "Bearer $token" } }
function Get($path, $token) { Invoke-RestMethod -Uri "$BASE$path" -Headers (AuthHeader $token) }

$idMarina  = (Get "/api/usuarios/me" $tMarina).id
$idCarlos  = (Get "/api/usuarios/me" $tCarlos).id
$idBeatriz = (Get "/api/usuarios/me" $tBeatriz).id

Write-Host "`nCriando itens..." -ForegroundColor Cyan

# ---- 2. Cada conta publica alguns itens ----
$itensMarina = @(
    @{ titulo = "Jaqueta jeans P/M"; descricao = "Usada poucas vezes."; categoria = "ROUPAS"; estadoConservacao = "SEMINOVO"; tipoPublicacao = "DOAR"; bairro = "Funcionários"; cidade = "Belo Horizonte"; uf = "MG"; impactoCo2Kg = 3.4 },
    @{ titulo = "Caixa de livros infantis"; descricao = "12 livros ilustrados."; categoria = "LIVROS"; estadoConservacao = "USADO"; tipoPublicacao = "DOAR"; bairro = "Savassi"; cidade = "Belo Horizonte"; uf = "MG"; impactoCo2Kg = 2.1 }
)
$itensCarlos = @(
    @{ titulo = "Estante de madeira"; descricao = "4 prateleiras."; categoria = "MOVEIS"; estadoConservacao = "USADO"; tipoPublicacao = "TROCAR"; bairro = "Centro"; cidade = "Belo Horizonte"; uf = "MG"; impactoCo2Kg = 11.8 }
)
$itensBeatriz = @(
    @{ titulo = "Liquidificador 3 velocidades"; descricao = "Funcionando perfeitamente."; categoria = "ELETRONICOS"; estadoConservacao = "USADO"; tipoPublicacao = "TROCAR"; bairro = "Santo Agostinho"; cidade = "Belo Horizonte"; uf = "MG"; impactoCo2Kg = 4.2 },
    @{ titulo = "Jogo de panelas antiaderente"; descricao = "5 peças, uso leve."; categoria = "COZINHA"; estadoConservacao = "USADO"; tipoPublicacao = "DOAR"; bairro = "Savassi"; cidade = "Belo Horizonte"; uf = "MG"; impactoCo2Kg = 3.9 }
)

$itemMarinaIds  = $itensMarina  | ForEach-Object { (Post "/api/itens" $_ $tMarina).id }
$itemCarlosIds  = $itensCarlos  | ForEach-Object { (Post "/api/itens" $_ $tCarlos).id }
$itemBeatrizIds = $itensBeatriz | ForEach-Object { (Post "/api/itens" $_ $tBeatriz).id }

Write-Host "  Itens criados." -ForegroundColor Green

Write-Host "`nCriando fluxo completo (solicitação -> chat -> agendamento -> avaliação)..." -ForegroundColor Cyan

# ---- 3. Carlos solicita o primeiro item de Marina ----
$solicitacao = Post "/api/solicitacoes" @{ itemId = $itemMarinaIds[0]; mensagem = "Oi! Ainda está disponível?" } $tCarlos
$solicitacaoId = $solicitacao.id

# ---- 4. Marina (doadora) aceita ----
Post "/api/solicitacoes/$solicitacaoId/aceitar" @{} $tMarina | Out-Null

# ---- 5. Trocam mensagens no chat ----
Post "/api/solicitacoes/$solicitacaoId/mensagens" @{ texto = "Oi! Sim, ainda está disponível :)" } $tMarina | Out-Null
Post "/api/solicitacoes/$solicitacaoId/mensagens" @{ texto = "Perfeito, quando posso buscar?" } $tCarlos | Out-Null
Post "/api/solicitacoes/$solicitacaoId/mensagens" @{ texto = "Pode ser amanhã de manhã!" } $tMarina | Out-Null

# ---- 6. Agendamento ----
$dataHora = (Get-Date).AddDays(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$agendamento = Post "/api/agendamentos" @{ solicitacaoId = $solicitacaoId; dataHora = $dataHora; localEncontro = "Portaria do Ed. Alameda, Funcionários" } $tCarlos
$agendamentoId = $agendamento.id

# ---- 7. Ambos confirmam a retirada ----
Post "/api/agendamentos/$agendamentoId/confirmar-doador" @{} $tMarina | Out-Null
Post "/api/agendamentos/$agendamentoId/confirmar-receptor" @{} $tCarlos | Out-Null

# ---- 8. Avaliação mútua ----
Post "/api/avaliacoes" @{ agendamentoId = $agendamentoId; avaliadoId = $idMarina; nota = 5; comentario = "Super atenciosa, recomendo!" } $tCarlos | Out-Null
Post "/api/avaliacoes" @{ agendamentoId = $agendamentoId; avaliadoId = $idCarlos; nota = 5; comentario = "Retirada tranquila, obrigada!" } $tMarina | Out-Null

Write-Host "`nPronto! 3 contas completas criadas:" -ForegroundColor Green
Write-Host "  marina@reviva.com  / reviva123"
Write-Host "  carlos@reviva.com  / reviva123"
Write-Host "  beatriz@reviva.com / reviva123"
Write-Host "`nMarina e Carlos já têm uma doação completa (item, chat, agendamento confirmado e avaliação)."
Write-Host "Beatriz tem itens publicados, prontos pra você continuar interagindo manualmente."
