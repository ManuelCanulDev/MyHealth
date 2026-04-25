/**
 * Comprueba que MYHEALTH_CONTRACT_ADDRESS tenga el MyHealth con getters de perfil on-chain.
 * Uso: node scripts/check-onchain.cjs (desde la raíz; lee .env)
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
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

c.methods
  .perfilNombre()
  .call()
  .then(function () {
    console.log("check-onchain: OK — contrato con perfil on-chain", at);
    process.exit(0);
  })
  .catch(function (e) {
    console.error("check-onchain: FALLO — el contrato no acepta perfilNombre (¿despliegue antiguo?).");
    console.error("  Dirección:", at);
    console.error("  ", e && e.message ? e.message : e);
    console.error("  Asegúrate: npm run forge:build && npm run forge:deploy:monad y actualizar .env");
    process.exit(1);
  });
