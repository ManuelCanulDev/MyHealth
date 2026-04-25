# MyHealth — Guía de integración (app móvil / front)

Base URL: la que levanta el compañero con `npm start` (por defecto `http://localhost:3000`).  
En dispositivo físico usa la **IP de la máquina** o un túnel (**ngrok**, **localtunnel**): la app debe alcanzar el mismo host y puerto.

**Red on-chain (Monad testnet):** `chainId` **10143** · RPC público: `https://testnet-rpc.monad.xyz`  
**Explorador:** <https://testnet.monadexplorer.com>

---

## 1. Seguridad

- **Nunca** metas claves privadas en la app móvil. Las lecturas van contra este API; las escrituras las firma el **backend** con su `.env` (o en el futuro, wallets con login).
- El parámetro **`contract`** (dirección `0x` del `MyHealth`) **es público**; identifica *qué* ficha se lee.

---

## 2. Cómo indicar el contrato

- **Lecturas** (`GET`): añade query **`?contract=0x...`** (contrato a consultar).  
  Si se omite, el servidor usa `MYHEALTH_CONTRACT_ADDRESS` de su `.env` (comportamiento de demo con un solo contrato).
- **Escrituras** (`POST`/`PATCH`): en el **JSON** del body, campo opcional **`"contract": "0x..."`**. Misma regla: si falta, usa el del `.env`.  
- La **cuenta del servidor** (`CUENTA` / `PRIVATE_KEY`) debe ser **owner** del contrato (o el contrato debe autorizar a esa cuenta) o la transacción fallará on-chain.

---

## 3. Endpoints mínimos para la app (solo lectura)

| Método | Ruta | Uso |
|--------|------|-----|
| `GET` | `/api` | Metadatos: red, `contratoDefault`, enlaces. |
| `GET` | `/health` | Comprobar que el servidor responde. |
| `GET` | `/api/ficha?contract=0x...` | **Principal:** ficha + contactos. |
| `GET` | `/api/datos?contract=0x...` | Solo alergias, condiciones, medicación, nota, owner. |
| `GET` | `/api/contactos?contract=0x...` | Solo lista de contactos. |

**Respuesta típica de** `GET /api/ficha`:

```json
{
  "contractAddress": "0x...",
  "owner": "0x...",
  "fotoUrl": "https://... o ipfs://... (no binario en cadena)",
  "religion": "…",
  "numeroSeguroSocial": "…",
  "tipoSangre": "A+",
  "alergias": "…",
  "condiciones": "…",
  "medicacion": "…",
  "notaEmergencia": "…",
  "contactos": [
    { "indice": 0, "nombre": "…", "parentesco": "…", "telefono": "…", "email": "…", "activo": true }
  ]
}
```

**Aviso:** `numeroSeguroSocial` y el resto de cadenas son **públicas** on-chain. La **foto** es una **URL/CID**; sube el archivo a IPFS o storage y pega el enlace.

**CORS** está habilitado: puedes consumir desde Flutter Web o otra app en otro origen (ajusta URL base).

---

## 4. Ejemplos

### cURL

```bash
# Ficha (recomendado para la app)
curl -s "http://localhost:3000/api/ficha?contract=0xTU_CONTRATO_MYHEALTH"

# Sin ?contract= si el backend tiene MYHEALTH_CONTRACT_ADDRESS en .env
curl -s "http://localhost:3000/api/ficha"
```

### Flutter (Dart) — `http`

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

final base = Uri.parse('http://10.0.2.2:3000'); // emulador Android -> localhost; en iOS prueba localhost
final contract = '0xf5a8227a0d560c6db39030f06Ab2bDcD741fE091'; // ejemplo

Future<Map<String, dynamic>> cargarFicha() async {
  final u = base.replace(
    path: '/api/ficha',
    queryParameters: {'contract': contract},
  );
  final r = await http.get(u, headers: {'Accept': 'application/json'});
  if (r.statusCode != 200) {
    throw Exception('${r.statusCode} ${r.body}');
  }
  return json.decode(r.body) as Map<String, dynamic>;
}
```

Sustituye `base` y `contract` según vuestro despliegue. Para **HTTPS** o dominio, cambia `base` a la URL del túnel.

---

## 5. Documentación OpenAPI / Swagger

- **Interfaz:** `GET /docs` (Swagger UI).
- **JSON:** `GET /openapi.json` (Postman, Insomnia, generadores de cliente).

---

## 6. QR de emergencia (propuesta)

Codifica en el QR una **URL o deep link** que abra la app o web con el `0x` del contrato, por ejemplo:

- `https://tudominio.com/emergencia?c=0x...` (tu front), o  
- `myhealth://ficha?contract=0x...` (deep link) y en la app lees el query y llamas a `GET /api/ficha?contract=...`.

No incluyas claves privadas en el QR; solo el **address del contrato** (y opcional `chainId=10143`).
