# MyHealth Backend: Smart Contracts & API ⚙️⛓️

El corazón de **MyHealth** reside en su backend, que combina la seguridad e inmutabilidad de los Smart Contracts en **Monad** con la flexibilidad de una API REST en **Node.js**.

## 🏗️ Componentes

### 1. Smart Contracts (Solidity)
Los contratos gestionan la lógica de negocio on-chain:
- **Almacenamiento Médico:** Registro de alergias, condiciones, medicamentos y notas.
- **Identidad On-Chain:** Nombre, fotografía (URL/CID), seguro social y religión.
- **Contactos SOS:** Lista de contactos autorizados para recibir notificaciones.
- **Seguridad:** Control de acceso basado en roles (Owner y Editores autorizados).
- **Mapa de Emergencias:** Registro de incidentes activos directamente en el contrato.

### 2. API REST (Node.js)
Actúa como intermediario seguro:
- **Web3 Integration:** Comunicación con la red Monad Testnet (Chain ID 10143).
- **Notificaciones:** Integración con Twilio (SMS) y SendGrid (Email).
- **Documentación:** Swagger UI interactiva disponible en `/docs`.
- **Firma de Transacciones:** Gestión segura de transacciones on-chain mediante llaves privadas configuradas en el servidor.

## 🛠️ Tecnologías

- **Blockchain:** Monad Testnet
- **Frameworks de Contratos:** Foundry & Truffle
- **Servidor:** Node.js, Express
- **Librería Blockchain:** Web3.js
- **Seguridad:** Dotenv para gestión de secretos

## 🚀 Configuración y Despliegue

### Requisitos Previos
- Node.js & npm
- Foundry (`forge`)
- Cuenta en Monad con fondos (faucet)

### Instalación
1. `npm install`
2. Copia `.env.example` a `.env` y rellena las variables:
   - `MONAD_RPC`: URL del nodo Monad.
   - `PRIVATE_KEY`: Llave privada del propietario del contrato.
   - `MYHEALTH_CONTRACT_ADDRESS`: Dirección del contrato desplegado.
   - `TWILIO_*` / `SENDGRID_*`: Credenciales para notificaciones.

### Scripts de Contratos
- `npm run compile`: Compila los contratos con Truffle.
- `npm run forge:build`: Compila los contratos con Foundry.
- `npm run forge:deploy:monad`: Despliega los contratos en la red Monad.

### Iniciar el Servidor
- `npm start`: Inicia la API en `http://localhost:3000`.

## 📖 Documentación de la API

Una vez iniciado el servidor, puedes acceder a:
- **Swagger UI:** `http://localhost:3000/docs`
- **OpenAPI JSON:** `http://localhost:3000/openapi.json`
- **Guía de Integración Móvil:** `http://localhost:3000/INTEGRACION_APP.md`

## 📂 Estructura de Carpetas

```text
backend/
├── backend/       # Código fuente del servidor Express
├── contracts/     # Smart Contracts en Solidity
├── migrations/    # Scripts de despliegue de Truffle
├── script/        # Scripts de despliegue de Foundry
├── scripts/       # Utilidades de validación y despliegue rápido
└── out/           # Artefactos de compilación de Foundry
```

---
Potenciando la medicina descentralizada en **Monad**.
