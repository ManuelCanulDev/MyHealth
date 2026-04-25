# MyHealth 🛡️💊

**MyHealth** es una plataforma descentralizada (dApp) integral diseñada para la gestión segura y el acceso inmediato a información médica crítica en situaciones de emergencia. Mediante el uso de **Blockchain (Monad Testnet)** y dispositivos **NFC**, MyHealth permite que el personal de rescate acceda a datos vitales que salvan vidas, manteniendo la soberanía de los datos del paciente y garantizando la inmutabilidad de la información.

## 🚀 Funcionalidades Principales

- **Ecosistema On-Chain (Monad):** Fichas médicas, contactos de emergencia y registros de acceso almacenados de forma inmutable en la red Monad (Chain ID 10143).
- **Acceso mediante NFC y QR:** Simulación de lectura de brazaletes y escaneo de códigos QR para recuperación instantánea de perfiles médicos.
- **Bóveda Médica Segura:** Información sensible protegida y segmentada, permitiendo acceso público a datos críticos (alergias, tipo de sangre) y acceso controlado a información detallada.
- **Notificaciones de Emergencia:** Alertas automáticas vía SMS y Correo Electrónico (Twilio/SendGrid) a los contactos SOS cuando se registra un acceso de emergencia.
- **Mapa de Emergencias On-Chain:** Sistema de geolocalización de alertas activas integrado directamente en el Smart Contract.
- **Gestión de Identidad:** Perfiles de usuario con fotografía, datos de seguro social y religión para una atención personalizada y respetuosa.

## 🏗️ Estructura del Proyecto

El sistema está compuesto por cuatro pilares fundamentales:

1. **`/application`**: Aplicación móvil multiplataforma desarrollada en **Flutter**. Incluye el módulo de lectura NFC y la interfaz de visualización de emergencia para rescatistas.
2. **`/frontend`**: Panel de control web desarrollado en **React + Vite**. Permite a los usuarios gestionar su ficha médica, configurar contactos y visualizar el historial de accesos.
3. **`/backend`**: API REST robusta en **Node.js** que actúa como puente entre los clientes y la Blockchain, gestionando firmas, notificaciones y la documentación OpenAPI/Swagger.
4. **`/backend/contracts`**: Smart Contracts desarrollados en **Solidity** utilizando **Foundry** y **Truffle**, optimizados para la red Monad.

## 🛠️ Tecnologías Utilizadas

- **Blockchain:** Monad Testnet (EVM Compatible).
- **Contratos:** Solidity, Foundry, Truffle.
- **Frontend Web:** React 18, Vite, Tailwind CSS, Lucide React.
- **App Móvil:** Flutter, Dart.
- **Backend API:** Node.js, Express, Web3.js.
- **Servicios Externos:** Twilio (SMS), SendGrid (Email).

## 📦 Guía de Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/ManuelCanulDev/MyHealth.git
cd MyHealth
```

### 2. Despliegue de Contratos (Backend)
```bash
cd backend
npm install
# Configura tu .env basado en .env.example
npm run forge:deploy:monad
```

### 3. Ejecutar el Backend API
```bash
npm start
```

### 4. Ejecutar el Frontend Web
```bash
cd ../frontend
npm install
npm run dev
```

### 5. Ejecutar la App Móvil
```bash
cd ../application
flutter pub get
flutter run
```

## 🔐 Seguridad y Privacidad

MyHealth implementa un modelo de seguridad híbrido:
1. **Capa On-Chain:** Los datos públicos de emergencia residen en el Smart Contract para disponibilidad inmediata 24/7.
2. **Capa de Aplicación:** El acceso a la gestión de la ficha requiere la autenticación del propietario del contrato.
3. **Privacidad:** Se recomienda el uso de CIDs de IPFS para archivos multimedia y el cifrado de campos sensibles antes de su almacenamiento on-chain si se requiere una capa adicional de privacidad.

---
Desarrollado con ❤️ para el ecosistema **Monad**.
