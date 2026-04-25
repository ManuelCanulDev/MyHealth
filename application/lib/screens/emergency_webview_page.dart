import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'package:grupokamar_myhealth/config/patient_nfc_config.dart';

/// Carga [kEmergencyWebUrl] integrada en la app (no sale al navegador del sistema).
class EmergencyWebViewPage extends StatefulWidget {
  const EmergencyWebViewPage({super.key});

  @override
  State<EmergencyWebViewPage> createState() => _EmergencyWebViewPageState();
}

class _EmergencyWebViewPageState extends State<EmergencyWebViewPage> {
  late final WebViewController _controller;
  var _loading = true;
  var _loadError = false;

  @override
  void initState() {
    super.initState();
    final uri = Uri.tryParse(kEmergencyWebUrl);
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            if (mounted) {
              setState(() => _loading = false);
            }
          },
          onWebResourceError: (_) {
            if (mounted) {
              setState(() {
                _loadError = true;
                _loading = false;
              });
            }
          },
        ),
      );
    if (uri != null && (uri.isScheme('https') || uri.isScheme('http'))) {
      unawaited(_controller.loadRequest(uri));
    } else {
      _loadError = true;
      _loading = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergencia'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          if (!_loadError)
            WebViewWidget(controller: _controller)
          else
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'No se pudo abrir la página. Revisa kEmergencyWebUrl en patient_nfc_config.dart',
                  textAlign: TextAlign.center,
                  style: t.textTheme.bodyLarge?.copyWith(
                    color: t.colorScheme.error,
                  ),
                ),
              ),
            ),
          if (_loading && !_loadError)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}
