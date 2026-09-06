const { execSync } = require("child_process");

const PORT = 43147;

function listeningPids() {
  let output = "";
  try {
    output = execSync("netstat -ano", { encoding: "utf8" });
  } catch {
    return [];
  }

  const pids = new Set();
  const portToken = `:${PORT} `;
  for (const line of output.split(/\r?\n/)) {
    if (!line.includes("LISTENING") || !line.includes(portToken)) continue;
    const pid = Number(line.trim().split(/\s+/).pop());
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

function processName(pid) {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
      encoding: "utf8",
    });
    const firstField = out.split(",")[0] ?? "";
    return firstField.replaceAll('"', "").replace(/\.exe$/i, "").trim();
  } catch {
    return "";
  }
}

for (const pid of listeningPids()) {
  const name = processName(pid).toLowerCase();
  if (name !== "node") {
    continue;
  }

  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
  } catch {
    // Process already exited.
  }
}
