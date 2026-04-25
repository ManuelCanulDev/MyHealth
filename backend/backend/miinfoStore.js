/**
 * @deprecated El perfil (nombre, apellido, teléfono, correo) vive ahora on-chain
 * (MyHealth: perfilNombre, etc.). El servidor ya no expone /api/miinfo.
 * Este módulo se mantiene solo por referencia; no hace falta el archivo `data/miinfo.json` para el producto.
 */
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const file = path.join(dataDir, "miinfo.json");
const legacyFile = path.join(dataDir, "pacientes.json");

function writeOne(obj) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

/**
 * Convierte legado (array) a un solo objeto; se ejecuta al arrancar si hace falta.
 */
function normalizarAlCargar() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(file)) {
    if (fs.existsSync(legacyFile)) {
      try {
        const raw = fs.readFileSync(legacyFile, "utf8");
        const j = JSON.parse(raw);
        if (Array.isArray(j) && j.length) {
          const x = j[j.length - 1];
          writeOne(nuevoDesdeCuerpo(x));
        } else {
          writeOne(borradorVacio());
        }
        try {
          fs.unlinkSync(legacyFile);
        } catch {
          /* */
        }
      } catch {
        writeOne(borradorVacio());
      }
    } else {
      writeOne(borradorVacio());
    }
    return;
  }
  try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      if (data.length === 0) {
        writeOne(borradorVacio());
        return;
      }
      const x = data[data.length - 1];
      writeOne(nuevoDesdeCuerpo(x));
    }
  } catch {
    writeOne(borradorVacio());
  }
}

function borradorVacio() {
  return {
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    actualizadoEn: new Date().toISOString(),
  };
}

function nuevoDesdeCuerpo(x) {
  return {
    nombre: String((x && x.nombre) || "").trim(),
    apellido: String((x && x.apellido) || "").trim(),
    telefono: String((x && x.telefono) || "").trim(),
    email: String((x && x.email) || "").trim(),
    actualizadoEn: new Date().toISOString(),
  };
}

/** Registro único: lectura de la “base” local. */
function leer() {
  normalizarAlCargar();
  const raw = fs.readFileSync(file, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ...borradorVacio() };
  }
  if (Array.isArray(data)) {
    if (!data.length) return { ...borradorVacio() };
    return nuevoDesdeCuerpo(data[data.length - 1]);
  }
  if (data && typeof data === "object") {
    return {
      nombre: String(data.nombre || "").trim(),
      apellido: String(data.apellido || "").trim(),
      telefono: String(data.telefono || "").trim(),
      email: String(data.email || "").trim(),
      actualizadoEn: data.actualizadoEn || new Date().toISOString(),
    };
  }
  return { ...borradorVacio() };
}

/** Acepta cuerpo plano, { datos: {...} } o un array con un elemento. */
function extraerCuerpoGuardar(p) {
  if (p == null) return {};
  if (Array.isArray(p) && p.length) {
    if (p[0] && typeof p[0] === "object") return p[0];
  }
  if (typeof p === "object" && p.datos != null && typeof p.datos === "object" && !Array.isArray(p.datos)) {
    return p.datos;
  }
  if (typeof p === "object" && !Array.isArray(p)) return p;
  return {};
}

/** Registro único: sobrescribe el archivo. */
function guardar(p) {
  normalizarAlCargar();
  const src = extraerCuerpoGuardar(p);
  const o = {
    nombre: String(src.nombre || "").trim(),
    apellido: String(src.apellido || "").trim(),
    telefono: String(src.telefono || "").trim(),
    email: String(src.email || "").trim(),
    actualizadoEn: new Date().toISOString(),
  };
  writeOne(o);
  return o;
}

module.exports = { leer, guardar, normalizarAlCargar };
