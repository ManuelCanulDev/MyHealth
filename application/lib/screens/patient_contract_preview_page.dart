import 'dart:async' show unawaited;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:grupokamar_myhealth/branding/my_health_logo.dart';
import 'package:grupokamar_myhealth/config/patient_nfc_config.dart';
import 'package:grupokamar_myhealth/screens/emergency_webview_page.dart';
import 'package:grupokamar_myhealth/services/myhealth_emergency_api.dart';
import 'package:grupokamar_myhealth/widgets/scanned_location_section.dart';

/// Detalle del contrato (Monad, desde + contrato). Sin importe.
class PatientContractPreviewPage extends StatefulWidget {
  const PatientContractPreviewPage({super.key});

  @override
  State<PatientContractPreviewPage> createState() =>
      _PatientContractPreviewPageState();
}

class _PatientContractPreviewPageState extends State<PatientContractPreviewPage> {
  double? _emergencyLat;
  double? _emergencyLng;
  String? _emergencyAddress;

  Future<void> _onEsUnaEmergencia(BuildContext context) async {
    HapticFeedback.heavyImpact();
    final t = Theme.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final nav = Navigator.of(context, rootNavigator: true);
    final base = kMyHealthApiBaseUrl.trim();

    if (base.isEmpty) {
      await nav.push<void>(
        MaterialPageRoute<void>(
          builder: (context) => const EmergencyWebViewPage(),
        ),
      );
      return;
    }

    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: Center(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 20),
                  Text(
                    'Registrando en el servidor y la red…',
                    style: t.textTheme.bodyLarge,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    try {
      final r = await MyHealthEmergencyApi.register(
        baseUrl: base,
        contractAddress: kPatientContractAddress,
        latitude: _emergencyLat,
        longitude: _emergencyLng,
        addressForDetail: _emergencyAddress,
        mapaApiKey: kMapaEmergenciaApiKey,
      );
      if (!r.emergenciaOk && context.mounted) {
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              r.emergenciaError ?? 'No se pudo notificar a contactos (API).',
            ),
          ),
        );
      } else if (r.mapaError != null && context.mounted) {
        messenger.showSnackBar(
          SnackBar(
            content: Text('Mapa: ${r.mapaError!}'),
          ),
        );
      }
    } on Object catch (e) {
      if (context.mounted) {
        messenger.showSnackBar(
          SnackBar(
            content: Text('Error de red: $e'),
          ),
        );
      }
    } finally {
      if (context.mounted) {
        nav.pop();
      }
    }

    if (context.mounted) {
      await nav.push<void>(
        MaterialPageRoute<void>(
          builder: (context) => const EmergencyWebViewPage(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final contract = kPatientContractAddress;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  const Center(
                    child: MyHealthLogo(height: 48),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'Detalle',
                      style: t.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _PreviewRow(
                            label: 'Red',
                            child: _MonadRowWithLogo(theme: t),
                          ),
                          const Divider(height: 28),
                          ScannedLocationSection(
                            theme: t,
                            onLocationResolved: ({
                              required double lat,
                              required double lng,
                              String? address,
                            }) {
                              setState(() {
                                _emergencyLat = lat;
                                _emergencyLng = lng;
                                _emergencyAddress = address;
                              });
                            },
                          ),
                          const SizedBox(height: 20),
                          _PreviewRow(
                            label: 'Contrato de paciente',
                            child: SelectableText(
                              contract,
                              style: t.textTheme.bodyLarge?.copyWith(
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.w600,
                                height: 1.4,
                                letterSpacing: 0.1,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      Navigator.of(context).pop();
                    },
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(56),
                    ),
                    child: const Text('Cerrar y volver al inicio'),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.tonal(
                    onPressed: () => unawaited(_onEsUnaEmergencia(context)),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(56),
                      foregroundColor: t.colorScheme.error,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.emergency_outlined, size: 24),
                        SizedBox(width: 10),
                        Text('Es una emergencia'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    kMyHealthApiBaseUrl.trim().isEmpty
                        ? 'Configura kMyHealthApiBaseUrl y el backend para registrar la lectura y el mapa en cadena, o solo se abrirá la web.'
                        : 'Se notificará al backend (y en cadena si aplica) y luego se abrirá la página de emergencia.',
                    textAlign: TextAlign.center,
                    style: t.textTheme.bodySmall?.copyWith(
                      color: t.colorScheme.onSurfaceVariant,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MonadRowWithLogo extends StatelessWidget {
  const _MonadRowWithLogo({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: Image.network(
            kMonadLogoImageUrl,
            width: 28,
            height: 28,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                width: 28,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiaryContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'M',
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: theme.colorScheme.onTertiaryContainer,
                  ),
                ),
              );
            },
            loadingBuilder: (context, child, progress) {
              if (progress == null) {
                return child;
              }
              return SizedBox(
                width: 28,
                height: 28,
                child: Center(
                  child: SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(width: 10),
        Text(
          kPreviewNetworkName,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _PreviewRow extends StatelessWidget {
  const _PreviewRow({
    required this.label,
    required this.child,
  });

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: t.textTheme.labelLarge?.copyWith(
            color: t.colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}
