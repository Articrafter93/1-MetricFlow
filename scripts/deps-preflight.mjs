import { URL } from "node:url";
import net from "node:net";
import https from "node:https";

const DEFAULT_REGISTRY = "https://registry.npmjs.org/";
const TCP_TIMEOUT_MS = 4000;
const HTTPS_TIMEOUT_MS = 6000;

function info(message) {
  process.stdout.write(`[deps-preflight] ${message}\n`);
}

function fail(message) {
  process.stderr.write(`[deps-preflight] ${message}\n`);
  process.exit(1);
}

function shouldSkip() {
  if (process.env.SKIP_DEPS_PREFLIGHT === "1") {
    info("SKIP_DEPS_PREFLIGHT=1, omitiendo verificacion.");
    return true;
  }

  if (process.env.npm_config_offline === "true") {
    info("npm_config_offline=true, omitiendo verificacion de red.");
    return true;
  }

  return false;
}

function getRegistryUrl() {
  const raw =
    process.env.npm_config_registry ??
    process.env.NPM_CONFIG_REGISTRY ??
    DEFAULT_REGISTRY;

  try {
    return new URL(raw);
  } catch {
    fail(`Registry invalido: ${raw}`);
    return new URL(DEFAULT_REGISTRY);
  }
}

function checkTcp(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(TCP_TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));

    socket.connect(port, host);
  });
}

function checkHttps(registryUrl) {
  return new Promise((resolve) => {
    const pingUrl = new URL("/-/ping", registryUrl);
    const request = https.get(
      pingUrl,
      {
        timeout: HTTPS_TIMEOUT_MS,
      },
      (response) => {
        response.resume();
        resolve(true);
      },
    );

    request.once("timeout", () => {
      request.destroy();
      resolve(false);
    });

    request.once("error", () => resolve(false));
  });
}

function printHelp(host) {
  fail(
    [
      `No hay salida HTTPS util hacia ${host}.`,
      "Acciones recomendadas:",
      "1) Desactivar VPN/proxy temporalmente para instalaciones npm.",
      "2) Verificar reglas de firewall de salida para node.exe y git.exe (TCP 443).",
      "3) Probar: Test-NetConnection registry.npmjs.org -Port 443",
      "4) Probar: npm ping",
      "Si necesitas forzar bypass puntual: SKIP_DEPS_PREFLIGHT=1 npm install",
    ].join("\n"),
  );
}

async function main() {
  if (shouldSkip()) {
    process.exit(0);
  }

  const registryUrl = getRegistryUrl();
  const host = registryUrl.hostname;
  const port = registryUrl.port
    ? Number(registryUrl.port)
    : registryUrl.protocol === "http:"
      ? 80
      : 443;

  const tcpOk = await checkTcp(host, port);
  if (!tcpOk) {
    printHelp(host);
  }

  const httpsOk = await checkHttps(registryUrl);
  if (!httpsOk) {
    printHelp(host);
  }

  info(`preflight OK (registry=${registryUrl.origin})`);
}

await main();
