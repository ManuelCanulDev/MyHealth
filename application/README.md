# MyHealth App 📱💊

La aplicación móvil de **MyHealth** es el punto de contacto físico entre los rescatistas y la información vital del paciente. Desarrollada con **Flutter**, permite la lectura de dispositivos NFC y códigos QR para recuperar instantáneamente la ficha médica on-chain.

## ✨ Características Principales

- **Lectura NFC:** Módulo integrado para el escaneo de brazaletes, tarjetas o dispositivos médicos compatibles con tecnología NFC.
- **Escaneo QR:** Lector de códigos QR de alta velocidad para acceso alternativo a la ficha médica.
- **Visualización de Emergencia:** Interfaz optimizada para rescatistas que muestra datos críticos (alergias, tipo de sangre, medicación actual) en segundos.
- **Geolocalización SOS:** Capacidad para enviar la ubicación exacta del incidente al activar una alerta de emergencia.
- **Webview de Emergencia:** Integración de componentes web para visualizaciones dinámicas de contratos y perfiles.
- **Sincronización con Blockchain:** Conexión directa a través de la API MyHealth para obtener datos en tiempo real de la red Monad.

## 🛠️ Stack Tecnológico

- **Framework:** [Flutter](https://flutter.dev/)
- **Lenguaje:** Dart
- **NFC:** `nfc_manager`
- **QR:** `mobile_scanner`
- **Geolocalización:** `geolocator` & `geocoding`
- **Red:** `http` para comunicación con el backend de MyHealth.

## 🚀 Instalación y Uso

### Requisitos Previos
- Flutter SDK (versión estable más reciente).
- Android Studio / Xcode para compilación nativa.
- Un dispositivo físico con soporte NFC para pruebas completas.

### Pasos para Configuración

1. **Instalar Dependencias:**
   ```bash
   flutter pub get
   ```

2. **Configurar URL del API:**
   Asegúrate de configurar la dirección IP de tu backend en `lib/services/myhealth_emergency_api.dart` o el archivo de configuración correspondiente para que la app pueda comunicarse con el servidor.

3. **Ejecutar en Modo Debug:**
   ```bash
   flutter run
   ```

## 📂 Estructura de la Aplicación

```text
lib/
├── branding/     # Estilos y logos de MyHealth
├── config/       # Configuración de red y constantes
├── scan/         # Módulos de escaneo NFC y QR
├── screens/      # Páginas principales (Emergencia, Preview, etc.)
├── services/     # Clientes API y lógica de negocio
└── widgets/      # Componentes de UI reutilizables
```

## 🛡️ Seguridad
La aplicación no almacena claves privadas ni información sensible de forma persistente. Actúa como un visor seguro de los datos almacenados on-chain, garantizando que la información siempre esté actualizada y disponible para quien la necesite en una emergencia.

---
Desarrollado como parte del ecosistema **MyHealth**.
