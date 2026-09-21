#!/usr/bin/env python3
"""
Gerador de entregas standalone do monorepo Reviva.

Uso:
    python build_entregas.py                # gera sprint1 e sprint2
    python build_entregas.py sprint1        # só sprint1
    python build_entregas.py sprint2        # só sprint2
    python build_entregas.py --clean        # limpa antes
"""

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
API_SRC = ROOT / "reviva-api" / "src" / "main" / "api"
API_RES = ROOT / "reviva-api" / "src" / "main" / "resources"
API_ROOT = ROOT / "reviva-api"
FRONT_SRC = ROOT / "reviva-frontend" / "src"
FRONT_ROOT = ROOT / "reviva-frontend"
ENTREGAS = ROOT / "entregas"

SPRINTS = {
    "sprint1": {
        "dir": "sprint1-conjunto3-tela1",
        "nome_pkg": "reviva-monorepo-sprint1",
        "api_conj03": ["solicitacao", "comum"],
    },
    "sprint2": {
        "dir": "sprint2-conjunto3-completo",
        "nome_pkg": "reviva-monorepo-sprint2",
        "api_conj03": ["solicitacao", "comum", "chat-negociacao"],
    },
}

# Backend: sempre copia (deps transversais)
API_ALWAYS = [
    "RevivaApiApplication.java",
    "auth",
    "shared",
]

# Backend: deps cross-conjunto (closure do conjunto-03)
API_CROSS = [
    "conjuntos/conjunto-01-publicacao-gestao/comum",
    "conjuntos/conjunto-04-perfil-reputacao/perfil",
    "conjuntos/conjunto-04-perfil-reputacao/reputacao/PontuacaoService.java",
    "conjuntos/conjunto-06-endereco-seguranca/seguranca-termos",
]

# Configs do frontend (raiz)
FRONT_CONFIGS = [
    "package.json", "vite.config.js", "index.html",
    "tailwind.config.js", "postcss.config.js",
    ".env", ".env.example", ".gitignore",
]

# Root da entrega
ROOT_FILES = [
    "start-backend.cjs",
    "reviva_massa_completa.js",
    "migrate-mongo-ids-to-objectid.js",
    "limpar_banco.js",
]

IGNORE = shutil.ignore_patterns(
    "node_modules", "target", "dist", ".vite", ".git", ".github",
    ".vscode", "db", "miro", "__pycache__", "*.log", "*.pyc",
)

IMPORT_RE = re.compile(r"^\s*import\s+com\.reviva\.api\.([A-Za-z0-9_.]+);", re.M)
PKG_RE = re.compile(r"^\s*package\s+([A-Za-z0-9_.]+);", re.M)


def log(m):
    print("  " + m)


def header(m):
    print("\n=== " + m + " ===")


def copy_dir(src: Path, dst: Path):
    if not src.exists():
        log("! ausente: " + str(src.relative_to(ROOT)))
        return
    if dst.exists():
        shutil.rmtree(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src, dst, ignore=IGNORE)
    log("OK " + str(src.relative_to(ROOT)) + " -> " + str(dst.relative_to(ROOT)))


def copy_file(src: Path, dst: Path):
    if not src.exists():
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    log("OK " + str(src.relative_to(ROOT)))
    return True


def write_root_package_json(dst: Path, nome: str):
    pkg = {
        "name": nome,
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "setup": "cd reviva-frontend && npm install",
            "start:frontend": "npm run dev --prefix reviva-frontend",
            "start:backend": "node start-backend.cjs",
            "seed:mongodb": "node --env-file=atlas-credentials.env reviva_massa_completa.js",
            "migrate:mongodb-ids": "node --env-file=atlas-credentials.env migrate-mongo-ids-to-objectid.js",
            "migrate:mongodb-ids:apply": "node --env-file=atlas-credentials.env migrate-mongo-ids-to-objectid.js --apply",
            "clear:mongodb": "node --env-file=atlas-credentials.env limpar_banco.js --confirm",
            "dev": "npm run setup && concurrently -n \"FRONT,API\" -c \"cyan,green\" \"npm run start:frontend\" \"npm run start:backend\"",
        },
        "dependencies": {"mongodb": "^6.18.0"},
        "devDependencies": {"concurrently": "^10.0.5"},
    }
    (dst / "package.json").write_text(json.dumps(pkg, indent=2) + "\n", encoding="utf-8")
    log("OK package.json (raiz)")


def write_env_file(dst: Path):
    txt = (
        "# Edite com as credenciais reais do MongoDB Atlas\n"
        "MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/reviva?retryWrites=true&w=majority\n"
        "MONGODB_DATABASE=reviva\n"
        "JWT_SECRET=reviva-dev-jwt-secret-2026-chave-com-256-bits-minimo\n"
        "JWT_EXPIRATION_MINUTES=1440\n"
        "NOTIFICACOES_EXPIRACAO_DIAS=30\n"
        "PORT=8080\n"
    )
    (dst / "atlas-credentials.env").write_text(txt, encoding="utf-8")
    log("OK atlas-credentials.env")


def write_gitignore(dst: Path):
    (dst / ".gitignore").write_text(
        "node_modules/\ntarget/\ndist/\n.vite/\n*.log\n.env\n",
        encoding="utf-8",
    )
    log("OK .gitignore")


def write_readme(dst: Path, sprint: str):
    txt = (
        "# Entrega " + sprint.upper() + " - Conjunto 3 (Solicitacao/Chat)\n\n"
        "Pacote standalone do conjunto-03.\n\n"
        "## Pre-requisitos\n"
        "- Node.js 18+\n"
        "- Java 21+\n"
        "- Maven 3.9+\n"
        "- MongoDB Atlas (ou local)\n\n"
        "## Setup\n\n"
        "1. Edite `atlas-credentials.env` com a URI do seu MongoDB.\n"
        "2. Rode:\n\n"
        "    npm install\n"
        "    npm run dev\n\n"
        "- Frontend: http://localhost:5173\n"
        "- API:      http://localhost:8080\n"
        "- Swagger:  http://localhost:8080/swagger-ui.html\n\n"
        "## Scripts\n\n"
        "| Comando | Descricao |\n"
        "|---|---|\n"
        "| npm run dev | Frontend + API em paralelo |\n"
        "| npm run start:frontend | So o frontend |\n"
        "| npm run start:backend | So a API |\n"
        "| npm run seed:mongodb | Popula o banco |\n"
        "| npm run migrate:mongodb-ids | Migra IDs para ObjectId |\n"
        "| npm run clear:mongodb | Limpa o banco |\n"
    )
    (dst / "README.md").write_text(txt, encoding="utf-8")
    log("OK README.md")


def scan_imports(api_dir: Path):
    pkg_to_file = {}
    for jf in api_dir.rglob("*.java"):
        txt = jf.read_text(encoding="utf-8", errors="ignore")
        m = PKG_RE.search(txt)
        if m:
            pkg_to_file[m.group(1)] = jf

    missing = set()
    for jf in api_dir.rglob("*.java"):
        txt = jf.read_text(encoding="utf-8", errors="ignore")
        for imp in IMPORT_RE.findall(txt):
            full = "com.reviva.api." + imp
            if full not in pkg_to_file:
                missing.add(full)

    if missing:
        log("AVISO: " + str(len(missing)) + " imports nao resolvidos:")
        for m in sorted(missing)[:30]:
            log("   - " + m)
        log("-> adicione os caminhos correspondentes em API_CROSS e rode de novo")
    else:
        log("OK imports com.reviva.api.* resolvidos")


def build_sprint(key: str, clean: bool):
    cfg = SPRINTS[key]
    dst = ENTREGAS / cfg["dir"]

    header("Gerando " + cfg["dir"])
    if clean and dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True, exist_ok=True)

    # 1. Raiz da entrega
    for f in ROOT_FILES:
        copy_file(ROOT / f, dst / f)
    write_root_package_json(dst, cfg["nome_pkg"])
    write_env_file(dst)
    write_gitignore(dst)
    write_readme(dst, key)

    # 2. Frontend
    fe = dst / "reviva-frontend"
    fe.mkdir(parents=True, exist_ok=True)
    for f in FRONT_CONFIGS:
        copy_file(FRONT_ROOT / f, fe / f)
    if (FRONT_ROOT / "public").exists():
        copy_dir(FRONT_ROOT / "public", fe / "public")

    # copia src/ inteiro (front e pequeno, evita quebrar App.jsx)
    copy_dir(FRONT_SRC, fe / "src")

    # 3. Backend
    api = dst / "reviva-api"
    api.mkdir(parents=True, exist_ok=True)
    copy_file(API_ROOT / "pom.xml", api / "pom.xml")

    res = api / "src" / "main" / "resources"
    res.mkdir(parents=True, exist_ok=True)
    for f in ("application.properties", "application.yml"):
        copy_file(API_RES / f, res / f)

    out_api = api / "src" / "main" / "api"
    out_api.mkdir(parents=True, exist_ok=True)

    # 3a. Sempre
    for item in API_ALWAYS:
        src = API_SRC / item
        if src.is_dir():
            copy_dir(src, out_api / item)
        else:
            copy_file(src, out_api / item)

    # 3b. Conjunto-03 (varia por sprint)
    c03_src = API_SRC / "conjuntos" / "conjunto-03-solicitacao-chat"
    c03_dst = out_api / "conjuntos" / "conjunto-03-solicitacao-chat"
    c03_dst.mkdir(parents=True, exist_ok=True)
    for sub in cfg["api_conj03"]:
        copy_dir(c03_src / sub, c03_dst / sub)

    # 3c. Deps cross-conjunto
    for rel in API_CROSS:
        src = API_SRC / rel
        if src.is_dir():
            copy_dir(src, out_api / rel)
        else:
            copy_file(src, out_api / rel)

    # 4. Validar imports
    scan_imports(out_api)

    # 5. Resumo
    n_java = sum(1 for _ in out_api.rglob("*.java"))
    n_front = 0
    fe_src = fe / "src"
    if fe_src.exists():
        n_front = sum(1 for _ in fe_src.rglob("*") if _.is_file())
    log("-> " + str(n_java) + " .java + " + str(n_front) + " arquivos em reviva-frontend/src")
    print("\nEntrega pronta: " + str(dst))


def main():
    args = sys.argv[1:]
    clean = "--clean" in args
    targets = [a for a in args if not a.startswith("--")]
    if not targets:
        targets = ["sprint1", "sprint2"]

    for t in targets:
        if t not in SPRINTS:
            print("desconhecido: " + t)
            sys.exit(1)
        build_sprint(t, clean)

    print("\n----------------------------------")
    print("Proximo passo:")
    print("  cd entregas/sprint1-conjunto3-tela1")
    print("  # edite atlas-credentials.env")
    print("  npm install && npm run dev")
    print("----------------------------------")


if __name__ == "__main__":
    main()
