/**
 * Comprueba que MYHEALTH_CONTRACT_ADDRESS tenga el MyHealth con getters de perfil on-chain.
 * Uso: node scripts/check-onchain.cjs (desde la raíz; lee .env)
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
  override: true,
});
const Web3 = require("web3");

const root = path.join(__dirname, "..");
const foundry = path.join(root, "out", "MyHealth.sol", "MyHealth.json");
const at = (process.env.MYHEALTH_CONTRACT_ADDRESS || "").trim();
const rpc = process.env.MONAD_RPC || "https://testnet-rpc.monad.xyz";

if (!at) {
  console.log("check-onchain: sin MYHEALTH_CONTRACT_ADDRESS, omito red.");
  process.exit(0);
}

if (!fs.existsSync(foundry)) {
  console.error("check-onchain: falta", foundry, "— ejecuta: npm run forge:build");
  process.exit(1);
}

const { abi } = JSON.parse(fs.readFileSync(foundry, "utf8"));
const w3 = new Web3(new Web3.providers.HttpProvider(rpc));
const c = new w3.eth.Contract(abi, at);

function fail(msg, detail) {
  console.error("check-onchain: FALLO —", msg);
  console.error("  Dirección en MYHEALTH_CONTRACT_ADDRESS:", at);
  if (detail) console.error("  ", detail);
  console.error(
    "  MYHEALTH_CONTRACT_ADDRESS debe ser la dirección del contrato (contractAddress en broadcast/.../run-latest.json), no la wallet que despliega (from)."
  );
  console.error("  Pasos: npm run forge:build && npm run forge:deploy:monad y copiar la dirección del contrato al .env");
  process.exit(1);
}

w3.eth
  .getCode(at)
  .then(function (code) {
    if (!code || code === "0x") {
      fail(
        "no hay bytecode en esa dirección (¿pusiste la cuenta desplegadora en vez del contrato?)."
      );
    }
    return c.methods.perfilNombre().call();
  })
  .then(function () {
    console.log("check-onchain: OK — contrato con perfil on-chain", at);
    process.exit(0);
  })
  .catch(function (e) {
    fail("el contrato no acepta perfilNombre (¿despliegue antiguo o ABI distinto?).", e && e.message ? e.message : e);
  });
