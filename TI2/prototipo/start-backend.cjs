const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const envFile = path.join(__dirname, "atlas-credentials.env");
if (!fs.existsSync(envFile)) {
  throw new Error("atlas-credentials.env nao encontrado na raiz do projeto.");
}

const env = { ...process.env };
for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=][^=]*)=(.*)\s*$/);
  if (!match) continue;
  env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI nao foi encontrada em atlas-credentials.env.");
}

const command = process.platform === "win32" ? "mvn.cmd" : "mvn";
const child = spawn(command, ["spring-boot:run"], {
  cwd: path.join(__dirname, "reviva-api"),
  env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", code => process.exit(code ?? 1));
child.on("error", error => {
  console.error("Nao foi possivel iniciar o Maven:", error.message);
  process.exit(1);
});
