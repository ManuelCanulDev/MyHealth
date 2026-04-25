/**
 * API REST MyHealth: lectura de datos on-chain, escritura firmada,
 * y alertas opcionales a contactos (tras cambio de datos o lectura de emergencia).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const Web3 = require("web3");
const { notificarContactos } = require("./notify");

const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.MONAD_RPC || "https://testnet-rpc.monad.xyz";
const CONTRACT_ADDRESS = process.env.MYHEALTH_CONTRACT_ADDRESS;
const FROM_ACCOUNT = process.env.CUENTA;
let PRIVATE_KEY = process.env.PRIVATE_KEY || "";
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = "0x" + PRIVATE_KEY;
}

const app = express();
const publicDir = path.join(__dirname, "..", "public");
app.use(cors());
app.use(express.json());

/**
 * Emergencia mapa: en memoria (prototipo) o en MyHealth.sol (MAPA_EMERGENCIA_ONCHAIN=1).
 * On-chain: `registrarEmergenciaMapa` / `limpiarEmergenciaMapa` (solo owner o editor) vía el servidor;
 * `leerEmergenciaMapa()` es público; GET del API hace `call()` sin clave.
 */
let mapaEmergenciaContador = 0;
let mapaEmergenciaActiva = null;

function mapaKeyOk(req) {
  const k = process.env.MAPA_EMERGENCIA_KEY;
  if (!k) return true;
  const a = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const x = (req.headers["x-mapa-key"] || "").trim();
  return a === k || x === k;
}

function mapaUsaOnchain() {
  return process.env.MAPA_EMERGENCIA_ONCHAIN === "1" || process.env.MAPA_EMERGENCIA_ONCHAIN === "true";
}

/**
 * @param {any} row resultado de leerEmergenciaMapa().call()
 */
function normalizarFilaMapaOnchain(row) {
  const g = (a, b) => (a !== undefined && a !== null ? a : b);
  const activa = g(row.activa, row[0]);
  const idv = g(row.id, row[1]);
  const lat1e6 = g(row.lat1e6, row[2]);
  const lng1e6 = g(row.lng1e6, row[3]);
  const nombre = g(row.nombre, row[4]) || "";
  const detalle = g(row.detalle, row[5]) || "";
  const emitidoEn = g(row.emitidoEn, row[6]);
  const ok = activa === true || activa === "true" || activa === 1;
  return {
    activa: ok,
    id: `emg-${String(idv)}`,
    lat: Number(lat1e6) / 1e6,
    lng: Number(lng1e6) / 1e6,
    nombrePaciente: String(nombre),
    detalle: String(detalle),
    emitidoEn:
      emitidoEn != null && String(emitidoEn) !== "0"
        ? new Date(Number(emitidoEn) * 1000).toISOString()
        : new Date(0).toISOString(),
  };
}

/** Mapa: rutas al inicio para que nunca queden ocultas por otra capa */
app.get("/api/mapa-de-emergencias/alerta", async (req, res) => {
  try {
    if (mapaUsaOnchain()) {
      const { web3, contract, address: at } = getBundleForRequest(req);
      await asegurarDireccionConCodigo(web3, at);
      if (typeof contract.methods.leerEmergenciaMapa !== "function") {
        return res.status(503).json({
          error:
            "El contrato no incluye leerEmergenciaMapa. Vuelve a desplegar el contrato y actualiza MYHEALTH_CONTRACT_ADDRESS.",
        });
      }
      const row = await contract.methods.leerEmergenciaMapa().call();
      const n = normalizarFilaMapaOnchain(row);
      if (!n.activa) {
        return res.json({ activa: false, fuente: "chain" });
      }
      return res.json({
        activa: true,
        id: n.id,
        lat: n.lat,
        lng: n.lng,
        nombrePaciente: n.nombrePaciente,
        detalle: n.detalle,
        emitidoEn: n.emitidoEn,
        fuente: "chain",
      });
    }
    if (!mapaEmergenciaActiva) {
      return res.json({ activa: false, fuente: "memoria" });
    }
    return res.json({ activa: true, fuente: "memoria", ...mapaEmergenciaActiva });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.get("/api/mapa-de-emergencias/alerta/", (req, res) => {
  res.redirect(308, "/api/mapa-de-emergencias/alerta");
});
app.post("/api/mapa-de-emergencias/alerta", async (req, res) => {
  if (!mapaKeyOk(req)) {
    return res.status(401).json({ error: "Clave de mapa inválida o faltante" });
  }
  const lat = Number(req.body && req.body.lat);
  const lng = Number(req.body && req.body.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: "Incluya lat y lng numéricos válidos" });
  }
  const nombrePaciente = String(
    (req.body && req.body.nombrePaciente) || "Paciente"
  ).trim() || "Paciente";
  const detalle = String((req.body && req.body.detalle) || "").trim();
  try {
    if (mapaUsaOnchain()) {
      if (!PRIVATE_KEY) {
        return res.status(503).json({ error: "Falta PRIVATE_KEY en .env para firmar la transacción on-chain" });
      }
      const { web3, contract, address: at } = getBundleForRequest(req);
      await asegurarDireccionConCodigo(web3, at);
      const firmante = getFirmanteServidorOrThrow(web3);
      await asegurarPuedeEditarFicha(contract, firmante);
      if (typeof contract.methods.registrarEmergenciaMapa !== "function") {
        return res.status(503).json({
          error:
            "El contrato no incluye registrarEmergenciaMapa. Redeploy y actualiza MYHEALTH_CONTRACT_ADDRESS.",
        });
      }
      const lat1e6 = Math.round(lat * 1e6);
      const lng1e6 = Math.round(lng * 1e6);
      const receipt = await enviarTransaccion(
        web3,
        contract.methods.registrarEmergenciaMapa(
          String(lat1e6),
          String(lng1e6),
          nombrePaciente,
          detalle
        ),
        at
      );
      const row = await contract.methods.leerEmergenciaMapa().call();
      const n = normalizarFilaMapaOnchain(row);
      return res.json({
        ok: true,
        fuente: "chain",
        receipt: receipt && receipt.transactionHash,
        id: n.id,
        lat: n.lat,
        lng: n.lng,
        nombrePaciente: n.nombrePaciente,
        detalle: n.detalle,
        emitidoEn: n.emitidoEn,
      });
    }
    mapaEmergenciaContador += 1;
    const id = "emg-" + Date.now() + "-" + mapaEmergenciaContador;
    mapaEmergenciaActiva = {
      id,
      lat,
      lng,
      nombrePaciente,
      detalle,
      emitidoEn: new Date().toISOString(),
    };
    return res.json({ ok: true, fuente: "memoria", ...mapaEmergenciaActiva });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.delete("/api/mapa-de-emergencias/alerta", async (req, res) => {
  if (!mapaKeyOk(req)) {
    return res.status(401).json({ error: "Clave de mapa inválida o faltante" });
  }
  try {
    if (mapaUsaOnchain()) {
      if (!PRIVATE_KEY) {
        return res.status(503).json({ error: "Falta PRIVATE_KEY en .env para firmar la transacción on-chain" });
      }
      const { web3, contract, address: at } = getBundleForRequest(req);
      await asegurarDireccionConCodigo(web3, at);
      const firmante = getFirmanteServidorOrThrow(web3);
      await asegurarPuedeEditarFicha(contract, firmante);
      if (typeof contract.methods.limpiarEmergenciaMapa !== "function") {
        return res.status(503).json({ error: "El contrato no incluye limpiarEmergenciaMapa. Redeploy el contrato." });
      }
      const receipt = await enviarTransaccion(web3, contract.methods.limpiarEmergenciaMapa(), at);
      return res.json({
        ok: true,
        activa: false,
        fuente: "chain",
        receipt: receipt && receipt.transactionHash,
      });
    }
    mapaEmergenciaActiva = null;
    return res.json({ ok: true, activa: false, fuente: "memoria" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/** Prioridad: salida de Foundry (`out/…`) si existe; si no, Truffle `build/contracts/`. */
function loadMyHealthArtifact() {
  const root = path.join(__dirname, "..");
  const foundryPath = path.join(root, "out", "MyHealth.sol", "MyHealth.json");
  const trufflePath = path.join(root, "build", "contracts", "MyHealth.json");
  if (fs.existsSync(foundryPath)) {
    const j = JSON.parse(fs.readFileSync(foundryPath, "utf8"));
    return { abi: j.abi };
  }
  if (fs.existsSync(trufflePath)) {
    return require(trufflePath);
  }
  throw new Error(
    "Falta el ABI. Ejecuta: forge build (o npm run forge:build) o truffle compile"
  );
}

function normalizeAddress(a) {
  if (!a || typeof a !== "string") return null;
  const t = a.trim();
  if (!t) return null;
  if (!Web3.utils.isAddress(t)) return null;
  return Web3.utils.toChecksumAddress(t);
}

/**
 * Contrato a usar: `?contract=0x` (o `body.contract` en POST) o .env MYHEALTH_CONTRACT_ADDRESS
 */
function resolveContractAddress(req) {
  const q = normalizeAddress(req.query && req.query.contract);
  if (q) return q;
  if (req.body && typeof req.body === "object" && req.body !== null) {
    const b = normalizeAddress(req.body.contract);
    if (b) return b;
  }
  if (CONTRACT_ADDRESS) {
    return Web3.utils.toChecksumAddress(CONTRACT_ADDRESS);
  }
  throw new Error(
    "Falta el contrato: configura MYHEALTH_CONTRACT_ADDRESS o envia ?contract=0x... (checksum opcional)"
  );
}

function getBundleAtAddress(at) {
  const artifact = loadMyHealthArtifact();
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
  return {
    web3,
    contract: new web3.eth.Contract(artifact.abi, at),
    address: at,
  };
}

function getBundleForRequest(req) {
  const at = resolveContractAddress(req);
  return getBundleAtAddress(at);
}

/**
 * @param {import("web3").default} web3
 * @param {string} at
 */
async function asegurarDireccionConCodigo(web3, at) {
  const code = await web3.eth.getCode(at);
  if (!code || code === "0x" || code === "0x0") {
    throw new Error(
      "Esa dirección no tiene un contrato desplegado. Revisa MYHEALTH_CONTRACT_ADDRESS o ?contract=0x… en Monad testnet."
    );
  }
}

/** Métodos añadidos en revisiones con campos de identificación; faltan en despliegues viejos. */
const GETTERS_IDENTIFICACION = ["fotoUrl", "religion", "numeroSeguroSocial", "tipoSangre"];

/** Lectura en paralelo; los despliegues sin estos getters no rompen toda la ficha. */
async function leerIdentificacionSiExisteEnContrato(contract) {
  const settled = await Promise.allSettled(
    GETTERS_IDENTIFICACION.map((name) => {
      const m = contract.methods[name];
      if (typeof m !== "function") return Promise.resolve("");
      return m().call();
    })
  );
  const out = {
    fotoUrl: "",
    religion: "",
    numeroSeguroSocial: "",
    tipoSangre: "",
  };
  GETTERS_IDENTIFICACION.forEach((name, i) => {
    const r = settled[i];
    if (r.status === "fulfilled" && r.value != null) out[name] = r.value;
  });
  return out;
}

const GETTERS_PERFIL = [
  "perfilNombre",
  "perfilApellido",
  "perfilTelefono",
  "perfilCorreo",
];

/** Nombre, apellido, teléfono y correo del titular on-chain. */
async function leerPerfilSiExisteEnContrato(contract) {
  const settled = await Promise.allSettled(
    GETTERS_PERFIL.map((name) => {
      const m = contract.methods[name];
      if (typeof m !== "function") return Promise.resolve("");
      return m().call();
    })
  );
  const out = {
    perfilNombre: "",
    perfilApellido: "",
    perfilTelefono: "",
    perfilCorreo: "",
  };
  GETTERS_PERFIL.forEach((name, i) => {
    const r = settled[i];
    if (r.status === "fulfilled" && r.value != null) out[name] = r.value;
  });
  return out;
}

/**
 * Dirección que firma: derivada de PRIVATE_KEY, validada frente a CUENTA si está definida.
 * Si usas otra clave distinta a CUENTA, el contrato recibe otra `msg.sender` y revierte.
 */
function getFirmanteServidorOrThrow(web3) {
  if (!PRIVATE_KEY) {
    throw new Error(
      "Falta PRIVATE_KEY en .env. Sin ella el servidor no puede actualizar el contrato on-chain."
    );
  }
  const fromKey = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY).address;
  if (FROM_ACCOUNT) {
    const a = Web3.utils.toChecksumAddress(FROM_ACCOUNT);
    const b = Web3.utils.toChecksumAddress(fromKey);
    if (a !== b) {
      throw new Error(
        `PRIVATE_KEY no coincide con CUENTA. La clave desbloquea ${b} pero CUENTA es ${a}. Ajusta .env.`
      );
    }
  }
  return fromKey;
}

/**
 * Mismo criterio que `soloEditor` en MyHealth.sol: owner o `autorizadoParaEditar`.
 */
/**
 * Comprueba que en esa dirección esté el MyHealth con `perfilNombre` (y getters asociados).
 * Los despliegues anteriores a esa versión no tienen el selector: todo revert al guardar.
 */
async function asegurarContratoSoportaPerfilSiSeEnviaPerfil(req, contract) {
  const claves = ["perfilNombre", "perfilApellido", "perfilTelefono", "perfilCorreo"];
  if (!claves.some((k) => req.body && req.body[k] !== undefined)) return;
  if (typeof contract.methods.perfilNombre !== "function") {
    throw new Error(
      "El ABI cargado no incluye perfil on-chain. Ejecuta `npm run forge:build` en el proyecto (usa `out/MyHealth.sol/MyHealth.json` antes que Truffle) y reinicia el API."
    );
  }
  try {
    await contract.methods.perfilNombre().call();
  } catch (e) {
    throw new Error(
      "Este contrato se desplegó antes de añadir nombre/apellido/teléfono/correo on-chain. " +
        "Vuelve a desplegar: `npm run forge:deploy:monad` y actualiza MYHEALTH_CONTRACT_ADDRESS en .env (reinicia el servidor). " +
        "Detalle: " +
        (e && e.message)
    );
  }
}

async function asegurarPuedeEditarFicha(contract, firmante) {
  const s = Web3.utils.toChecksumAddress(firmante);
  let own;
  try {
    own = await contract.methods.owner().call();
  } catch (e) {
    throw new Error(
      `No se pudo leer owner() en el contrato. Revisa MYHEALTH_CONTRACT_ADDRESS y MONAD_RPC. ${e.message || ""}`.trim()
    );
  }
  if (s === Web3.utils.toChecksumAddress(own)) return;
  let aut = false;
  try {
    const r = await contract.methods.autorizadoParaEditar(s).call();
    aut = r === true || r === "true" || r === 1;
  } catch {
    aut = false;
  }
  if (aut) return;
  throw new Error(
    `No autorizado para editar: el servidor firma con ${s} y el owner del contrato es ${own}. "execution reverted" sale cuando msg.sender no es el owner. Opciones: pon en .env la PRIVATE_KEY del owner, o pide al owner que ejecute setAutorizado(${s}, true) en el contrato.`
  );
}

function enriquecerErrorEvm(e) {
  let m = (e && e.message) || String(e);
  if (e && e.reason) m += " — " + String(e.reason);
  const d =
    e &&
    (e.data ||
      (e.cause && e.cause.data) ||
      (e.innerError && e.innerError.data) ||
      (e.originalError && e.originalError.data));
  if (d && typeof d === "string" && d.length > 2) {
    m += " [data: " + d.slice(0, 180) + (d.length > 180 ? "…" : "") + "]";
  }
  return m;
}

async function enviarTransaccion(web3, methodCall, toAddress) {
  const from = getFirmanteServidorOrThrow(web3);
  const data = methodCall.encodeABI();
  try {
    const gasLlamada = 12_000_000;
    await web3.eth.call({ from, to: toAddress, data, gas: Web3.utils.toHex(gasLlamada) });
  } catch (e) {
    throw new Error(
      "eth_call: la ejecución revertiría on-chain. " + enriquecerErrorEvm(e) +
        " Comprueba MYHEALTH_CONTRACT_ADDRESS (mismo despliegue), ABI/forge build y que el .env tenga el contrato nuevo; reinicia el servidor."
    );
  }
  let gas;
  try {
    gas = await methodCall.estimateGas({ from });
  } catch (e) {
    throw new Error("estimateGas: " + enriquecerErrorEvm(e));
  }
  const tx = {
    from,
    to: toAddress,
    data,
    gas: Math.min(Math.ceil(gas * 1.2), 5_000_000),
  };
  const signed = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  try {
    return await web3.eth.sendSignedTransaction(signed.rawTransaction);
  } catch (e) {
    throw new Error("Envío a la red: " + enriquecerErrorEvm(e));
  }
}

async function obtenerContactosActivos(contract) {
  const total = await contract.methods.totalContactos().call();
  const n = Number(total);
  const lista = [];
  for (let i = 0; i < n; i++) {
    const r = await contract.methods.contactoEmergencia(i).call();
    const activo = r.activo !== undefined ? r.activo : r["4"];
    if (activo) {
      lista.push({
        indice: i,
        nombre: r.nombre ?? r["0"],
        parentesco: r.parentesco ?? r["1"],
        telefono: r.telefono ?? r["2"],
        email: r.email ?? r["3"],
        activo: true,
      });
    }
  }
  return lista;
}

app.get("/health", (_req, res) => {
  res.json({ servicio: "myhealth-api", ok: true });
});

/** Resumen para integradores (móvil / otro servicio) */
app.get("/api", (_req, res) => {
  res.json({
    nombre: "MyHealth API",
    version: 1,
    documentacion: "/openapi.json",
    guia: "/INTEGRACION_APP.md",
    red: {
      chainId: 10143,
      nombre: "Monad Testnet",
      rpcPublico: RPC_URL,
      explorador: "https://testnet.monadexplorer.com",
    },
    contratoDefault: CONTRACT_ADDRESS || null,
    nota:
      "Prototipo: una ficha por el contrato en MYHEALTH_CONTRACT_ADDRESS (un titular). GET /api/ficha?contract=0x... (o sin query con .env). En productivo, un despliegue por paciente. Escritura: CUENTA = owner del contrato indicado.",
  });
});

/** Lectura pública de la ficha (mismo callejero que en cadena) */
app.get("/api/datos", async (req, res) => {
  try {
    const { web3, contract, address: at } = getBundleForRequest(req);
    await asegurarDireccionConCodigo(web3, at);
    const [alergias, condiciones, medicacion, notaEmergencia, owner, ident, perfil] =
      await Promise.all([
        contract.methods.alergias().call(),
        contract.methods.condiciones().call(),
        contract.methods.medicacion().call(),
        contract.methods.notaEmergencia().call(),
        contract.methods.owner().call(),
        leerIdentificacionSiExisteEnContrato(contract),
        leerPerfilSiExisteEnContrato(contract),
      ]);
    res.json({
      contractAddress: at,
      owner,
      alergias,
      condiciones,
      medicacion,
      notaEmergencia,
      ...ident,
      ...perfil,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/contactos", async (req, res) => {
  try {
    const { contract } = getBundleForRequest(req);
    const contactos = await obtenerContactosActivos(contract);
    res.json({ contactos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Ficha + contactos (para app movil) */
app.get("/api/ficha", async (req, res) => {
  try {
    const { web3, contract, address: at } = getBundleForRequest(req);
    await asegurarDireccionConCodigo(web3, at);
    const [alergias, condiciones, medicacion, notaEmergencia, owner, ident, perfil, contactos] =
      await Promise.all([
        contract.methods.alergias().call(),
        contract.methods.condiciones().call(),
        contract.methods.medicacion().call(),
        contract.methods.notaEmergencia().call(),
        contract.methods.owner().call(),
        leerIdentificacionSiExisteEnContrato(contract),
        leerPerfilSiExisteEnContrato(contract),
        obtenerContactosActivos(contract).catch(() => []),
      ]);
    res.json({
      contractAddress: at,
      owner,
      alergias,
      condiciones,
      medicacion,
      notaEmergencia,
      ...ident,
      ...perfil,
      contactos,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * Guarda la ficha completa (varias transacciones: una por campo presente en el body).
 * Panel web: un clic en "Guardar ficha".
 */
app.post("/api/ficha/actualizar", async (req, res) => {
  try {
    const { web3, contract, address: at } = getBundleForRequest(req);
    await asegurarDireccionConCodigo(web3, at);
    const firmante = getFirmanteServidorOrThrow(web3);
    await asegurarPuedeEditarFicha(contract, firmante);
    await asegurarContratoSoportaPerfilSiSeEnviaPerfil(req, contract);
    const {
      alergias = "",
      condiciones = "",
      medicacion = "",
      notaEmergencia = "",
      notificar = false,
    } = req.body;
    const campos = [
      { key: "alergias", def: (v) => contract.methods.actualizarAlergias(v) },
      { key: "condiciones", def: (v) => contract.methods.actualizarCondiciones(v) },
      { key: "medicacion", def: (v) => contract.methods.actualizarMedicacion(v) },
      { key: "notaEmergencia", def: (v) => contract.methods.actualizarNotaEmergencia(v) },
      { key: "fotoUrl", def: (v) => contract.methods.actualizarFotoUrl(v) },
      { key: "religion", def: (v) => contract.methods.actualizarReligion(v) },
      {
        key: "numeroSeguroSocial",
        def: (v) => contract.methods.actualizarNumeroSeguroSocial(v),
      },
      { key: "tipoSangre", def: (v) => contract.methods.actualizarTipoSangre(v) },
      { key: "perfilNombre", def: (v) => contract.methods.actualizarPerfilNombre(v) },
      { key: "perfilApellido", def: (v) => contract.methods.actualizarPerfilApellido(v) },
      { key: "perfilTelefono", def: (v) => contract.methods.actualizarPerfilTelefono(v) },
      { key: "perfilCorreo", def: (v) => contract.methods.actualizarPerfilCorreo(v) },
    ];
    const transacciones = [];
    for (const { key, def } of campos) {
      if (req.body[key] === undefined) continue;
      let receipt;
      try {
        receipt = await enviarTransaccion(
          web3,
          def(String(req.body[key] ?? "")),
          at
        );
      } catch (e) {
        const msg = (e && e.message) || String(e);
        throw new Error('Fallo al actualizar el campo "' + key + '": ' + msg);
      }
      transacciones.push({ campo: key, hash: receipt?.transactionHash });
    }
    let notificaciones;
    if (notificar) {
      const contactos = await obtenerContactosActivos(contract);
      const cuerpo = `Se actualizo la ficha en el contrato ${at}.`;
      notificaciones = await notificarContactos(
        contactos,
        "MyHealth: ficha medica actualizada",
        cuerpo
      );
    }
    res.json({ transacciones, notificaciones });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function actualizacionBody(req) {
  return [
    "alergias",
    "condiciones",
    "medicacion",
    "notaEmergencia",
    "fotoUrl",
    "religion",
    "numeroSeguroSocial",
    "tipoSangre",
    "perfilNombre",
    "perfilApellido",
    "perfilTelefono",
    "perfilCorreo",
  ].find((k) => req.body[k] !== undefined);
}

app.patch("/api/datos", async (req, res) => {
  try {
    const { web3, contract, address: at } = getBundleForRequest(req);
    await asegurarDireccionConCodigo(web3, at);
    const firmante = getFirmanteServidorOrThrow(web3);
    await asegurarPuedeEditarFicha(contract, firmante);
    await asegurarContratoSoportaPerfilSiSeEnviaPerfil(req, contract);
    const campo = actualizacionBody(req);
    if (!campo) {
      return res.status(400).json({
        error:
          "Incluya uno de: alergias, condiciones, medicacion, notaEmergencia, fotoUrl, religion, numeroSeguroSocial, tipoSangre, perfilNombre, perfilApellido, perfilTelefono, perfilCorreo",
      });
    }
    const valor = String(req.body[campo] ?? "");
    const methods = {
      alergias: () => contract.methods.actualizarAlergias(valor),
      condiciones: () => contract.methods.actualizarCondiciones(valor),
      medicacion: () => contract.methods.actualizarMedicacion(valor),
      notaEmergencia: () => contract.methods.actualizarNotaEmergencia(valor),
      fotoUrl: () => contract.methods.actualizarFotoUrl(valor),
      religion: () => contract.methods.actualizarReligion(valor),
      numeroSeguroSocial: () => contract.methods.actualizarNumeroSeguroSocial(valor),
      tipoSangre: () => contract.methods.actualizarTipoSangre(valor),
      perfilNombre: () => contract.methods.actualizarPerfilNombre(valor),
      perfilApellido: () => contract.methods.actualizarPerfilApellido(valor),
      perfilTelefono: () => contract.methods.actualizarPerfilTelefono(valor),
      perfilCorreo: () => contract.methods.actualizarPerfilCorreo(valor),
    };
    const receipt = await enviarTransaccion(web3, methods[campo](), at);
    if (req.body.notificar === true) {
      const contactos = await obtenerContactosActivos(contract);
      const asunto = "MyHealth: actualizacion de ficha medica";
      const cuerpo = `Se actualizo ${campo} en su contrato ${at}. Revise la app o el explorador.`;
      const notif = await notificarContactos(contactos, asunto, cuerpo);
      return res.json({ receipt: receipt?.transactionHash, notificaciones: notif });
    }
    return res.json({ receipt: receipt?.transactionHash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/contactos", async (req, res) => {
  try {
    const { web3, contract, address: at } = getBundleForRequest(req);
    await asegurarDireccionConCodigo(web3, at);
    const firmante = getFirmanteServidorOrThrow(web3);
    await asegurarPuedeEditarFicha(contract, firmante);
    const {
      nombre = "",
      parentesco = "",
      telefono = "",
      email = "",
    } = req.body;
    const receipt = await enviarTransaccion(
      web3,
      contract.methods.agregarContactoEmergencia(
        nombre,
        parentesco,
        telefono,
        email
      ),
      at
    );
    res.json({ receipt: receipt?.transactionHash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/contactos/:indice/desactivar", async (req, res) => {
  try {
    const { web3, contract, address: at } = getBundleForRequest(req);
    await asegurarDireccionConCodigo(web3, at);
    const firmante = getFirmanteServidorOrThrow(web3);
    await asegurarPuedeEditarFicha(contract, firmante);
    const indice = req.params.indice;
    const receipt = await enviarTransaccion(
      web3,
      contract.methods.desactivarContacto(indice),
      at
    );
    res.json({ receipt: receipt?.transactionHash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * Tras simular escaneo QR: registra en cadena (opcional) y avisa a contactos.
 * Requiere CUENTA/PRIVATE_KEY para `registrarLecturaEmergencia` o puede omitirse on-chain.
 */
app.post("/api/emergencia/alerta", async (req, res) => {
  try {
    const { contract, web3, address: at } = getBundleForRequest(req);
    const { registrarSoloLectura = false } = req.body;
    if (registrarSoloLectura && PRIVATE_KEY) {
      const from = getFirmanteServidorOrThrow(web3);
      const data = contract.methods.registrarLecturaEmergencia().encodeABI();
      const gas = await contract.methods
        .registrarLecturaEmergencia()
        .estimateGas({ from });
      const tx = {
        from,
        to: at,
        data,
        gas: Math.min(Math.ceil(gas * 1.2), 5_000_000),
      };
      const signed = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
      await web3.eth.sendSignedTransaction(signed.rawTransaction);
    }
    if (req.body.notificar === false) {
      return res.json({ avisos: "omitido" });
    }
    const contactos = await obtenerContactosActivos(contract);
    const asunto = "MyHealth: acceso o lectura de emergencia";
    const cuerpo =
      req.body.mensaje ||
      "Se registro un acceso/lectura de emergencia vinculada a esta ficha. Compruebe a su familiar.";
    const notif = await notificarContactos(contactos, asunto, cuerpo);
    res.json({ notificaciones: notif });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Front: después de toda la API (evita que static intercepte /api/*) */
app.get("/mapa-de-emergencias", (_req, res) => {
  res.sendFile(path.join(publicDir, "mapa-de-emergencias.html"));
});
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});
app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`MyHealth API en http://localhost:${PORT}`);
  if (CONTRACT_ADDRESS) {
    try {
      console.log(
        `  Contrato por defecto: ${Web3.utils.toChecksumAddress(CONTRACT_ADDRESS)} (reiniciar el proceso si cambias MYHEALTH_CONTRACT_ADDRESS en .env)`
      );
    } catch {
      console.log("  Contrato por defecto:", CONTRACT_ADDRESS);
    }
  } else {
    console.log("  Aviso: define MYHEALTH_CONTRACT_ADDRESS en .env");
  }
});
