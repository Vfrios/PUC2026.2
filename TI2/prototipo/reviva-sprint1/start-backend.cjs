const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const env = { ...process.env };
for (const filename of [".env", "atlas-credentials.env"]) {
  const envPath = path.join(__dirname, filename);
  if (!fs.existsSync(envPath)) continue;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || Object.prototype.hasOwnProperty.call(env, match[1])) continue;

    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    env[match[1]] = value;
  }
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
