import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:grupokamar_myhealth/branding/my_health_brand.dart';
import 'package:grupokamar_myhealth/branding/my_health_logo.dart';
import 'package:grupokamar_myhealth/config/patient_nfc_config.dart';
import 'package:grupokamar_myhealth/screens/patient_contract_preview_page.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:nfc_manager/nfc_manager_android.dart';
import 'package:nfc_manager/nfc_manager_ios.dart';

// --- Lectura de UID/identificador del tag NFC (solo presencia) ---

Uint8List? _readTagIdBytes(NfcTag tag) {
  switch (defaultTargetPlatform) {
    case TargetPlatform.android:
      return NfcTagAndroid.from(tag)?.id;
    case TargetPlatform.iOS:
      return MiFareIos.from(tag)?.identifier ??
          Iso7816Ios.from(tag)?.identifier ??
          Iso15693Ios.from(tag)?.identifier ??
          FeliCaIos.from(tag)?.currentIDm;
    default:
      return null;
  }
}

/// Tema: paleta cálida, textos amplios, componentes con radio generoso.
ThemeData myHealthLightTheme() {
  const primary = MyHealthBrand.pink;
  const surface = Color(0xFFFFFBFE);
  const radius = 20.0;
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primary,
      brightness: Brightness.light,
      primary: primary,
      onPrimary: Colors.white,
      surface: surface,
    ),
    scaffoldBackgroundColor: surface,
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      color: Colors.white,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius),
        side: BorderSide(
          color: MyHealthBrand.pink.withValues(alpha: 0.12),
        ),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
        ),
        elevation: 0,
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        height: 1.2,
        letterSpacing: -0.5,
      ),
      headlineSmall: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        height: 1.25,
      ),
      titleLarge: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        height: 1.3,
      ),
      bodyLarge: TextStyle(
        fontSize: 19,
        height: 1.45,
        fontWeight: FontWeight.w500,
      ),
      bodyMedium: TextStyle(
        fontSize: 17,
        height: 1.4,
      ),
      labelLarge: TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
      ),
    ),
  );
}

class ScanHomePage extends StatefulWidget {
  const ScanHomePage({super.key});

  @override
  State<ScanHomePage> createState() => _ScanHomePageState();
}

class _ScanHomePageState extends State<ScanHomePage>
    with TickerProviderStateMixin {
  int _tabIndex = 0;

  late final AnimationController _nfcPulse;
  String? _nfcError;
  bool _nfcListening = false;
  bool _nfcStarted = false;
  bool _nfcNeedButton = false;

  MobileScannerController? _qrController;
  String? _lastQr;
  String? _qrError;
  bool _qrWantsScan = true;

  @override
  void initState() {
    super.initState();
    _nfcPulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);
    if (_supportsMobileHardware) {
      _qrController = MobileScannerController(
        autoStart: false,
        formats: [BarcodeFormat.qrCode],
        facing: CameraFacing.back,
        detectionSpeed: DetectionSpeed.noDuplicates,
      );
    }
    WidgetsBinding.instance
        .addPostFrameCallback((_) => unawaited(_initNfcIfPossible()));
  }

  bool get _supportsMobileHardware =>
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS);

  @override
  void dispose() {
    _nfcPulse.dispose();
    if (_supportsMobileHardware) {
      unawaited(NfcManager.instance.stopSession());
    }
    _qrController?.dispose();
    super.dispose();
  }

  void _showCopiedToast() {
    if (!context.mounted) {
      return;
    }
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.white, size: 22),
            SizedBox(width: 12),
            Text('Copiado al portapapeles'),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        duration: const Duration(seconds: 2),
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _onCopyId(String s) {
    unawaited(Clipboard.setData(ClipboardData(text: s)));
    _showCopiedToast();
  }

  Future<void> _onTabSelected(int i) async {
    if (i == _tabIndex) {
      return;
    }
    HapticFeedback.selectionClick();
    if (i == 0) {
      await _pauseQr();
    } else {
      await _pauseNfc();
    }
    if (!mounted) {
      return;
    }
    setState(() => _tabIndex = i);
    if (i == 0) {
      return;
    }
    if (i == 1) {
      await _tryStartQr();
    }
  }

  Future<void> _pauseNfc() async {
    if (!_supportsMobileHardware) {
      return;
    }
    try {
      await NfcManager.instance.stopSession();
    } catch (_) {}
    if (!mounted) {
      return;
    }
    if (_nfcListening) {
      setState(() {
        _nfcListening = false;
        _nfcNeedButton = true;
      });
    }
  }

  Future<void> _tryStartQr() async {
    if (!_supportsMobileHardware || _qrController == null) {
      return;
    }
    if (_qrWantsScan) {
      try {
        await _qrController!.start();
      } catch (e) {
        if (mounted) {
          setState(() {
            _qrError =
                'No se pudo abrir la cámara. Revisa el permiso en ajustes.';
            _qrWantsScan = false;
          });
        }
      }
    }
  }

  Future<void> _pauseQr() async {
    if (_qrController == null) {
      return;
    }
    try {
      await _qrController!.stop();
    } catch (_) {}
  }

  Future<void> _initNfcIfPossible() async {
    if (!_supportsMobileHardware) {
      setState(() {
        _nfcError = 'NFC y cámara están pensados para la app móvil (Android o iOS).';
      });
      return;
    }
    final availability = await NfcManager.instance.checkAvailability();
    if (!mounted) {
      return;
    }
    switch (availability) {
      case NfcAvailability.unsupported:
        setState(() {
          _nfcError = 'Este dispositivo no tiene NFC. Puedes usar el escáner de código QR.';
        });
        return;
      case NfcAvailability.disabled:
        setState(() {
          _nfcError = 'Activa el NFC en los ajustes del teléfono para usar la tarjeta.';
        });
        return;
      case NfcAvailability.enabled:
        break;
    }
    if (!mounted) {
      return;
    }
    setState(() {
      _nfcStarted = true;
      _nfcError = null;
    });
    if (_tabIndex == 0) {
      _startNfcSession();
    }
  }

  void _startNfcSession() {
    if (!_supportsMobileHardware || !_nfcStarted) {
      return;
    }
    setState(() {
      _nfcListening = true;
      _nfcNeedButton = false;
      _nfcError = null;
    });
    NfcManager.instance.startSession(
      pollingOptions: {
        NfcPollingOption.iso14443,
        NfcPollingOption.iso15693,
      },
      alertMessageIos: 'My Health: acerca la tarjeta',
      onDiscovered: (NfcTag tag) {
        unawaited(_handleNfcTag(tag));
      },
      onSessionErrorIos: (NfcReaderSessionErrorIos err) {
        if (!mounted) {
          return;
        }
        setState(() {
          _nfcListening = false;
          _nfcNeedButton = true;
          if (err.code !=
              NfcReaderErrorCodeIos.readerSessionInvalidationErrorUserCanceled) {
            _nfcError = 'Lectura NFC no disponible. Intenta de nuevo.';
          }
        });
      },
    );
  }

  Future<void> _handleNfcTag(NfcTag tag) async {
    final bytes = _readTagIdBytes(tag);
    if (bytes == null || bytes.isEmpty) {
      if (mounted) {
        setState(() {
          _nfcError = 'No se pudo leer el identificador de la tarjeta.';
          _nfcListening = false;
          _nfcNeedButton = true;
        });
      }
      await NfcManager.instance
          .stopSession(errorMessageIos: 'No se obtuvo el identificador');
    } else {
      if (!mounted) {
        return;
      }
      HapticFeedback.mediumImpact();
      setState(() {
        _nfcError = null;
        _nfcListening = false;
        _nfcNeedButton = true;
      });
      await NfcManager.instance
          .stopSession(alertMessageIos: 'Tag leído');
      if (!mounted) {
        return;
      }
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (context) => const PatientContractPreviewPage(),
          fullscreenDialog: true,
        ),
      );
    }
  }

  void _nfcScanAgain() {
    HapticFeedback.lightImpact();
    setState(() => _nfcError = null);
    _startNfcSession();
  }

  Future<void> _onQrDetect(BarcodeCapture capture) async {
    if (capture.barcodes.isEmpty) {
      return;
    }
    final b = capture.barcodes.first;
    final value = b.displayValue ?? b.rawValue;
    if (value == null || value.isEmpty) {
      return;
    }
    await _qrController?.stop();
    if (!mounted) {
      return;
    }
    HapticFeedback.mediumImpact();
    setState(() {
      _lastQr = value;
      _qrError = null;
      _qrWantsScan = false;
    });
    if (!mounted) {
      return;
    }
    // Misma pantalla que tras leer el tag NFC: detalle del contrato + ubicación.
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (context) => const PatientContractPreviewPage(),
        fullscreenDialog: true,
      ),
    );
  }

  Future<void> _qrScanAgain() async {
    HapticFeedback.lightImpact();
    setState(() {
      _qrError = null;
      _qrWantsScan = true;
    });
    try {
      await _qrController?.start();
    } catch (e) {
      if (mounted) {
        setState(() {
          _qrError = 'No se pudo abrir la cámara.';
          _qrWantsScan = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    const gradient = BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color(0xFFFCE4EC),
          Color(0xFFFDF5F7),
          Color(0xFFFFFAFB),
        ],
        stops: [0.0, 0.5, 1.0],
      ),
    );

    if (!_supportsMobileHardware) {
      return DecoratedBox(
        decoration: gradient,
        child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            title: const MyHealthLogo(height: 34),
            backgroundColor: Colors.transparent,
          ),
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const MyHealthLogo(height: 56),
                  const SizedBox(height: 24),
                  Text(
                    'Pensada para móvil',
                    style: t.textTheme.headlineSmall,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'En un iPhone o Android podrás leer tarjetas NFC y códigos QR con la cámara.',
                    textAlign: TextAlign.center,
                    style: t.textTheme.bodyLarge?.copyWith(
                      color: t.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return DecoratedBox(
      decoration: gradient,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: const MyHealthLogo(height: 40),
          actions: [
            if (_tabIndex == 0 && _nfcError != null)
              IconButton(
                icon: const Icon(Icons.refresh_rounded, size: 28),
                tooltip: 'Reintentar',
                onPressed: () async {
                  HapticFeedback.lightImpact();
                  setState(() => _nfcError = null);
                  if (_nfcStarted) {
                    _nfcScanAgain();
                  } else {
                    unawaited(_initNfcIfPossible());
                  }
                },
              ),
            if (_tabIndex == 1 && _qrError != null)
              IconButton(
                icon: const Icon(Icons.refresh_rounded, size: 28),
                tooltip: 'Reintentar',
                onPressed: () {
                  HapticFeedback.lightImpact();
                  unawaited(_qrScanAgain());
                },
              ),
          ],
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
              child: _TabSwitch(
                index: _tabIndex,
                onChanged: (i) {
                  unawaited(_onTabSelected(i));
                },
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 380),
                  switchInCurve: Curves.easeOutCubic,
                  switchOutCurve: Curves.easeInCubic,
                  transitionBuilder: (child, anim) {
                    return FadeTransition(
                      opacity: anim,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0, 0.035),
                          end: Offset.zero,
                        ).animate(
                          CurvedAnimation(
                            parent: anim,
                            curve: Curves.easeOutCubic,
                          ),
                        ),
                        child: child,
                      ),
                    );
                  },
                  child: _tabIndex == 0
                  ? _NfcPage(
                      key: const ValueKey('nfc'),
                      t: t,
                      pulse: _nfcPulse,
                      error: _nfcError,
                      listening: _nfcListening,
                      started: _nfcStarted,
                      needButton: _nfcNeedButton,
                      onScanAgain: _nfcScanAgain,
                    )
                      : _QrPage(
                          key: const ValueKey('qr'),
                          t: t,
                          controller: _qrController!,
                          lastQr: _lastQr,
                          error: _qrError,
                          wantsScan: _qrWantsScan,
                          onDetect: _onQrDetect,
                          onScanAgain: _qrScanAgain,
                          onCopy: _onCopyId,
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabSwitch extends StatelessWidget {
  const _TabSwitch({required this.index, required this.onChanged});

  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Semantics(
      label: 'Modo de lectura',
      child: Row(
        children: [
          Expanded(
            child: _TabChip(
              index: 0,
              current: index,
              icon: Icons.contactless,
              shortLabel: 'NFC',
              longLabel: 'Tarjeta',
              onTap: () => onChanged(0),
              scheme: t.colorScheme,
              text: t.textTheme,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _TabChip(
              index: 1,
              current: index,
              icon: Icons.qr_code_2,
              shortLabel: 'QR',
              longLabel: 'Código',
              onTap: () => onChanged(1),
              scheme: t.colorScheme,
              text: t.textTheme,
            ),
          ),
        ],
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  const _TabChip({
    required this.index,
    required this.current,
    required this.icon,
    required this.shortLabel,
    required this.longLabel,
    required this.onTap,
    required this.scheme,
    required this.text,
  });

  final int index;
  final int current;
  final IconData icon;
  final String shortLabel;
  final String longLabel;
  final VoidCallback onTap;
  final ColorScheme scheme;
  final TextTheme text;

  @override
  Widget build(BuildContext context) {
    final selected = index == current;
    return AnimatedScale(
      scale: selected ? 1.02 : 1.0,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOutCubic,
      child: Material(
        color: selected
            ? scheme.primaryContainer
            : scheme.surfaceContainerHighest.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(22),
        elevation: selected ? 0 : 0,
        shadowColor: selected ? scheme.primary.withValues(alpha: 0.2) : null,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(22),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              border: selected
                  ? Border.all(
                      color: scheme.primary.withValues(alpha: 0.25),
                      width: 1.5,
                    )
                  : null,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    icon,
                    size: 32,
                    color: selected ? scheme.primary : scheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        shortLabel,
                        style: text.labelLarge?.copyWith(
                          fontSize: 15,
                          color: selected
                              ? scheme.primary
                              : scheme.onSurfaceVariant,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        longLabel,
                        style: text.bodyMedium?.copyWith(
                          fontSize: 13,
                          color: selected
                              ? scheme.onPrimaryContainer
                              : scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NfcPage extends StatelessWidget {
  const _NfcPage({
    super.key,
    required this.t,
    required this.pulse,
    this.error,
    required this.listening,
    required this.started,
    required this.needButton,
    required this.onScanAgain,
  });

  final ThemeData t;
  final AnimationController pulse;
  final String? error;
  final bool listening;
  final bool started;
  final bool needButton;
  final VoidCallback onScanAgain;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (error == null) ...[
              Text(
                needButton && !listening
                    ? 'Cuando quieras otra tarjeta, toca el botón verde de abajo.'
                    : kNfcApoyeTelefonoTagPaciente,
                textAlign: TextAlign.center,
                style: t.textTheme.bodyLarge?.copyWith(
                  color: t.colorScheme.onSurfaceVariant,
                ),
              ),
            ] else ...[
              _ErrorCallout(
                t: t,
                message: error!,
                icon: Icons.nfc,
              ),
            ],
            const SizedBox(height: 20),
            Center(
              child: _NfcIconBlock(
                t: t,
                pulse: pulse,
                showWaiting: listening && error == null,
              ),
            ),
            const SizedBox(height: 24),
            if (started && needButton && !listening) ...[
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: onScanAgain,
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                ),
                icon: const Icon(Icons.contactless, size: 32),
                label: Text(
                  error != null
                      ? 'Volver a intentar'
                      : 'Escanear otra tarjeta',
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ErrorCallout extends StatelessWidget {
  const _ErrorCallout({
    required this.t,
    required this.message,
    required this.icon,
  });

  final ThemeData t;
  final String message;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: t.colorScheme.errorContainer.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: t.colorScheme.error.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 36, color: t.colorScheme.error),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'No pudimos leer ahora',
                  style: t.textTheme.labelLarge?.copyWith(
                    color: t.colorScheme.onErrorContainer,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: t.textTheme.bodyLarge?.copyWith(
                    color: t.colorScheme.onErrorContainer,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BouncyPanel extends StatefulWidget {
  const _BouncyPanel({required this.id, required this.child});

  final String id;
  final Widget child;

  @override
  State<_BouncyPanel> createState() => _BouncyPanelState();
}

class _BouncyPanelState extends State<_BouncyPanel>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..forward();
  }

  @override
  void didUpdateWidget(covariant _BouncyPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.id != widget.id) {
      _c.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: Tween<double>(begin: 0.92, end: 1.0).animate(
        CurvedAnimation(parent: _c, curve: Curves.easeOutBack, reverseCurve: Curves.easeIn),
      ),
      child: FadeTransition(
        opacity: Tween<double>(begin: 0, end: 1).animate(
          CurvedAnimation(
            parent: _c,
            curve: const Interval(0, 0.5, curve: Curves.easeOut),
            reverseCurve: Curves.easeIn,
          ),
        ),
        child: widget.child,
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({
    required this.t,
    required this.title,
    required this.value,
    required this.icon,
    required this.accent,
    required this.onCopy,
  });

  final ThemeData t;
  final String title;
  final String value;
  final IconData icon;
  final Color accent;
  final ValueChanged<String> onCopy;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 16, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Icon(icon, size: 28, color: accent),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: t.textTheme.titleLarge?.copyWith(
                      color: accent,
                    ),
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () => onCopy(value),
                  style: IconButton.styleFrom(
                    backgroundColor: accent.withValues(alpha: 0.12),
                    foregroundColor: accent,
                  ),
                  tooltip: 'Copiar',
                  icon: const Icon(Icons.copy_rounded, size: 24),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SelectableText(
              value,
              textAlign: TextAlign.left,
              style: t.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
                fontFamily: 'monospace',
                fontSize: 20,
                height: 1.4,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NfcIconBlock extends StatelessWidget {
  const _NfcIconBlock({
    required this.t,
    required this.pulse,
    required this.showWaiting,
  });

  final ThemeData t;
  final AnimationController pulse;
  final bool showWaiting;

  @override
  Widget build(BuildContext context) {
    final c = t.colorScheme.primary;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 220,
          height: 220,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Anillos estáticos (profundidad)
              for (int i = 0; i < 3; i++)
                Container(
                  width: 200.0 - i * 20,
                  height: 200.0 - i * 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: c.withValues(alpha: 0.1 + 0.05 * i),
                      width: 1.2,
                    ),
                  ),
                ),
              AnimatedBuilder(
                animation: pulse,
                builder: (context, child) {
                  final s = 0.9 + (pulse.value * 0.1);
                  return Transform.scale(
                    scale: s,
                    child: child,
                  );
                },
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: t.colorScheme.primaryContainer,
                    boxShadow: [
                      BoxShadow(
                        color: c.withValues(alpha: 0.18),
                        blurRadius: 40,
                        offset: const Offset(0, 12),
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.nfc_rounded,
                    size: 100,
                    color: c,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (showWaiting) ...[
          const SizedBox(height: 28),
          const SizedBox(
            width: 44,
            height: 44,
            child: CircularProgressIndicator(
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Esperando la tarjeta…',
            style: t.textTheme.bodyLarge?.copyWith(
              color: t.colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }
}

class _QrPage extends StatelessWidget {
  const _QrPage({
    super.key,
    required this.t,
    required this.controller,
    this.lastQr,
    this.error,
    required this.wantsScan,
    required this.onDetect,
    required this.onScanAgain,
    required this.onCopy,
  });

  final ThemeData t;
  final MobileScannerController controller;
  final String? lastQr;
  final String? error;
  final bool wantsScan;
  final Future<void> Function(BarcodeCapture) onDetect;
  final Future<void> Function() onScanAgain;
  final ValueChanged<String> onCopy;

  @override
  Widget build(BuildContext context) {
    if (error != null && lastQr == null) {
      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: _ErrorCallout(
            t: t,
            message: error!,
            icon: Icons.camera_alt_outlined,
          ),
        ),
      );
    }

    if (!wantsScan && lastQr != null) {
      return SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.check_circle_rounded,
                  size: 40,
                  color: t.colorScheme.tertiary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Listo',
                  style: t.textTheme.headlineSmall?.copyWith(
                    color: t.colorScheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Contenido del código',
              textAlign: TextAlign.center,
              style: t.textTheme.bodyLarge?.copyWith(
                color: t.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 20),
            _BouncyPanel(
              id: 'qr:$lastQr',
              child: _ResultCard(
                t: t,
                title: 'Código QR',
                value: lastQr!,
                icon: Icons.qr_code_2,
                accent: t.colorScheme.tertiary,
                onCopy: onCopy,
              ),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onScanAgain,
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(60),
              ),
              icon: const Icon(Icons.qr_code_scanner, size: 32),
              label: const Text('Escanear otro código'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Icon(
                Icons.tips_and_updates_outlined,
                size: 28,
                color: t.colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Luz clara, teléfono firme, código dentro del recuadro.',
                  textAlign: TextAlign.left,
                  style: t.textTheme.bodyLarge?.copyWith(
                    color: t.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return ClipRRect(
                borderRadius: const BorderRadius.all(Radius.circular(24)),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    MobileScanner(
                      controller: controller,
                      onDetect: (c) {
                        unawaited(onDetect(c));
                      },
                    ),
                    _DimScanOverlay(
                      w: constraints.maxWidth,
                      h: constraints.maxHeight,
                    ),
                    Center(
                      child: IgnorePointer(
                        child: Container(
                          width: 256,
                          height: 256,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: Colors.white,
                              width: 3.5,
                            ),
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.35),
                                blurRadius: 20,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 20,
                      child: FilledButton.tonalIcon(
                        onPressed: () => unawaited(controller.toggleTorch()),
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                        ),
                        icon: const Icon(Icons.flashlight_on_rounded, size: 28),
                        label: Text('Luz', style: t.textTheme.labelLarge),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Oscurece la vista alrededor del área de escaneo (4 rectángulos).
class _DimScanOverlay extends StatelessWidget {
  const _DimScanOverlay({required this.w, required this.h});

  final double w;
  final double h;

  @override
  Widget build(BuildContext context) {
    const boxW = 256.0;
    const boxH = 256.0;
    final left = (w - boxW) / 2;
    final top = (h - boxH) / 2;
    const dim = Color(0x88000000);

    return Stack(
      children: [
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: top.clamp(0.0, h),
          child: const ColoredBox(color: dim),
        ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          height: (h - top - boxH).clamp(0.0, h),
          child: const ColoredBox(color: dim),
        ),
        Positioned(
          top: top,
          left: 0,
          width: left.clamp(0.0, w),
          height: boxH,
          child: const ColoredBox(color: dim),
        ),
        Positioned(
          top: top,
          right: 0,
          width: (w - left - boxW).clamp(0.0, w),
          height: boxH,
          child: const ColoredBox(color: dim),
        ),
      ],
    );
  }
}
