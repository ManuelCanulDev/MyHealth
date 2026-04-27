// Copia y datos editables. El UUID/UID del tag NFC no se usa en la vista de contrato.

/// Instrucción en la pestaña de tarjeta.
const String kNfcApoyeTelefonoTagPaciente =
    'Apoye el telefono para leer el tag del paciente.';

// --- Vista previa (contrato en red Monad) ---

/// Contrato de paciente mostrado en la pantalla de preview (no el UUID leído del tag).
const String kPatientContractAddress =
    '0x88a935692Dbf2704aB5EF855fD6C9bfa9c38129D';

/// Titular de la ficha (p. ej. `nombrePaciente` en el mapa de emergencias on-chain vía el API).
const String kNombreTitularFicha = 'Agripino Flores';

/// Red donde vive el contrato.
const String kPreviewNetworkName = 'Monad';

/// Imagen del logo de Monad (PNG en red). Sustituye la URL o usa un `Image.asset` en código si añades el archivo a `assets/`.
const String kMonadLogoImageUrl =
    'https://logo.svgcdn.com/token-branded/monad.png';

// --- Ubicación al abrir el detalle del contrato ---

const String kLocationPermissionDenied =
    'Sin permiso de ubicación. Actívalo en ajustes para ver la dirección y coordenadas.';

const String kLocationServiceDisabled =
    'Activa el GPS o la ubicación en el dispositivo.';

const String kLocationUnavailableWeb =
    'La ubicación no está disponible en web.';

const String kLocationAddressFallback =
    'Ubicación obtenida (sin dirección postal detallada).';

const String kLocationErrorGeneric =
    'No se pudo obtener la ubicación. Vuelve a intentar o revisa ajustes de ubicación.';

const String kLocationTimeout =
    'El GPS tardó demasiado. Asegúrate de tener señal (o cielo despejado) y vuelve a abrir la pantalla.';

const String kLocationErrorConfig =
    'Falta la configuración de permisos de ubicación en la app.';

// --- Emergencia: web abriendo dentro de la app (WebView) ---

/// Base de la web de emergencia (sin el contrato). El navegador abre [kEmergencyWebOpenUrl].
const String kEmergencyWebUrl = 'https://my-health.grupokamar.com.mx/paciente/';

/// Página final: [kEmergencyWebUrl] + [kPatientContractAddress] (misma ficha).
const String kEmergencyWebOpenUrl = '$kEmergencyWebUrl$kPatientContractAddress';

/// Base del API MyHealth (`server.js`: OpenAPI en `/openapi.json`), **sin** `/` final.
/// Ejemplos: `https://api.tu-dominio.com` o en emulador Android `http://10.0.2.2:3000` (requisito HTTP: cleartext en Android o solo HTTPS en producción).
/// Si queda **vacía**, al pulsar «Es una emergencia» solo se abre la web de emergencia (sin `POST` al backend).
const String kMyHealthApiBaseUrl = 'https://monad.grupokamar.com.mx';

/// Misma clave que `MAPA_EMERGENCIA_KEY` en el `.env` del backend, para `POST /api/mapa-de-emergencias/alerta` si aplica. Vacía = sin header.
const String kMapaEmergenciaApiKey =
    '414f276d3f6c6a16a468e5d8f86a652237a76058c2714743a1855f704d2d90c6';
