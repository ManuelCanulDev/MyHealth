import 'dart:convert';

import 'package:http/http.dart' as http;

/// Resultado de [MyHealthEmergencyApi.register] (API del backend en `server.js`).
class EmergencyRegisterResult {
  const EmergencyRegisterResult({
    required this.emergenciaOk,
    this.emergenciaError,
    this.mapaError,
  });

  final bool emergenciaOk;
  final String? emergenciaError;
  final String? mapaError;
}

String _base(String raw) {
  var s = raw.trim();
  if (s.isEmpty) {
    throw StateError('baseUrl vacía');
  }
  while (s.endsWith('/')) {
    s = s.substring(0, s.length - 1);
  }
  return s;
}

Map<String, String> _mapaHeaders(String? key) {
  final h = <String, String>{'Content-Type': 'application/json; charset=utf-8'};
  final k = key?.trim();
  if (k != null && k.isNotEmpty) {
    h['X-Mapa-Key'] = k;
  }
  return h;
}

String? _errorBodyMessage(String body) {
  if (body.isEmpty) {
    return null;
  }
  try {
    final j = jsonDecode(body);
    if (j is Map && j['error'] != null) {
      return j['error'].toString();
    }
  } catch (_) {}
  return body.length > 200 ? '${body.substring(0, 200)}…' : body;
}

/// Llamadas a `POST /api/emergencia/alerta` y opcional `POST /api/mapa-de-emergencias/alerta`.
class MyHealthEmergencyApi {
  MyHealthEmergencyApi._();

  /// [contractAddress] contrato 0x…; [latitude]/[longitude] para el mapa si el backend lo soporta.
  /// [registrarLecturaOnChain] manda `registrarLecturaEmergencia()` vía [PRIVATE_KEY] del servidor.
  static Future<EmergencyRegisterResult> register({
    required String baseUrl,
    required String contractAddress,
    bool registrarLecturaOnChain = true,
    bool notificarContactos = true,
    String? mensajeAContactos,
    double? latitude,
    double? longitude,
    String? addressForDetail,
    String? mapaApiKey,
  }) async {
    final b = _base(baseUrl);
    String? mapaError;

    final emergUri = Uri.parse('$b/api/emergencia/alerta');
    final emBody = <String, dynamic>{
      'contract': contractAddress,
      'registrarSoloLectura': registrarLecturaOnChain,
      'notificar': notificarContactos,
    };
    if (mensajeAContactos != null && mensajeAContactos.isNotEmpty) {
      emBody['mensaje'] = mensajeAContactos;
    }

    var emergenciaOk = false;
    String? emergenciaError;
    final emRes = await http
        .post(
          emergUri,
          headers: const {'Content-Type': 'application/json; charset=utf-8'},
          body: jsonEncode(emBody),
        )
        .timeout(const Duration(seconds: 30));

    if (emRes.statusCode >= 200 && emRes.statusCode < 300) {
      emergenciaOk = true;
    } else {
      emergenciaError = _errorBodyMessage(emRes.body) ??
          'HTTP ${emRes.statusCode}';
    }

    if (latitude != null && longitude != null) {
      final mapUri = Uri.parse('$b/api/mapa-de-emergencias/alerta');
      final detalle = addressForDetail != null && addressForDetail.isNotEmpty
          ? 'Emergencia MyHealth — $addressForDetail'
          : 'Emergencia MyHealth (app móvil)';
      final mapBody = <String, dynamic>{
        'contract': contractAddress,
        'lat': latitude,
        'lng': longitude,
        'nombrePaciente': 'Paciente',
        'detalle': detalle,
      };
      try {
        final mapRes = await http
            .post(
              mapUri,
              headers: _mapaHeaders(mapaApiKey),
              body: jsonEncode(mapBody),
            )
            .timeout(const Duration(seconds: 30));
        if (mapRes.statusCode < 200 || mapRes.statusCode >= 300) {
          mapaError = _errorBodyMessage(mapRes.body) ??
              'Mapa HTTP ${mapRes.statusCode}';
        }
      } on Object catch (e) {
        mapaError = e.toString();
      }
    }

    return EmergencyRegisterResult(
      emergenciaOk: emergenciaOk,
      emergenciaError: emergenciaError,
      mapaError: mapaError,
    );
  }
}
