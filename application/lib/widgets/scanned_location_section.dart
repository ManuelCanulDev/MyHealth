import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

import 'package:grupokamar_myhealth/config/patient_nfc_config.dart';

/// Carga la ubicación actual: dirección aproximada y coordenadas.
class ScannedLocationSection extends StatefulWidget {
  const ScannedLocationSection({
    super.key,
    required this.theme,
    this.onLocationResolved,
  });

  final ThemeData theme;

  /// Al obtener GPS y dirección; para enviar lat/lng al API de emergencia.
  final void Function({required double lat, required double lng, String? address})?
      onLocationResolved;

  @override
  State<ScannedLocationSection> createState() => _ScannedLocationSectionState();
}

class _ScannedLocationSectionState extends State<ScannedLocationSection> {
  String? _addressLine;
  String? _latLongLine;
  String? _error;
  var _loading = true;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  static const _positionTimeLimit = Duration(seconds: 40);

  /// En Android, `LocationSettings` genérico no encadena bien con Fused/legacy;
  /// usamos ajustes nativos, última posición y reintento con LocationManager.
  Future<Position> _resolvePosition() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      try {
        return await Geolocator.getCurrentPosition(
          locationSettings: AndroidSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: _positionTimeLimit,
          ),
        );
      } on TimeoutException {
        final last = await Geolocator.getLastKnownPosition();
        if (last != null) {
          return last;
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('scanned_location: Fused error: $e');
        }
      }
      return Geolocator.getCurrentPosition(
        locationSettings: AndroidSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: _positionTimeLimit,
          forceLocationManager: true,
        ),
      );
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      try {
        return await Geolocator.getCurrentPosition(
          locationSettings: AppleSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: _positionTimeLimit,
          ),
        );
      } on TimeoutException {
        final last = await Geolocator.getLastKnownPosition();
        if (last != null) {
          return last;
        }
        rethrow;
      }
    }
    return Geolocator.getCurrentPosition(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        timeLimit: _positionTimeLimit,
      ),
    );
  }

  Future<void> _load() async {
    if (kIsWeb) {
      if (mounted) {
        setState(() {
          _error = kLocationUnavailableWeb;
          _loading = false;
        });
      }
      return;
    }

    try {
      var service = await Geolocator.isLocationServiceEnabled();
      if (!service) {
        if (mounted) {
          setState(() {
            _error = kLocationServiceDisabled;
            _loading = false;
          });
        }
        return;
      }

      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied ||
          perm == LocationPermission.deniedForever) {
        if (mounted) {
          setState(() {
            _error = kLocationPermissionDenied;
            _loading = false;
          });
        }
        return;
      }

      final pos = await _resolvePosition();
      final lat = pos.latitude;
      final lng = pos.longitude;
      final coords =
          '${lat.toStringAsFixed(6)}, ${lng.toStringAsFixed(6)}';

      var address = '—';
      try {
        final places = await placemarkFromCoordinates(lat, lng);
        if (places.isNotEmpty) {
          address = _formatPlacemark(places.first);
        }
      } catch (_) {
        address = kLocationAddressFallback;
      }

      if (!mounted) {
        return;
      }
      widget.onLocationResolved?.call(lat: lat, lng: lng, address: address);
      setState(() {
        _addressLine = address;
        _latLongLine = coords;
        _loading = false;
      });
    } on LocationServiceDisabledException {
      if (mounted) {
        setState(() {
          _error = kLocationServiceDisabled;
          _loading = false;
        });
      }
    } on PermissionDefinitionsNotFoundException {
      if (mounted) {
        setState(() {
          _error = kLocationErrorConfig;
          _loading = false;
        });
      }
    } on TimeoutException {
      if (mounted) {
        setState(() {
          _error = kLocationTimeout;
          _loading = false;
        });
      }
    } catch (e, st) {
      if (kDebugMode) {
        debugPrint('scanned_location: $e\n$st');
      }
      if (mounted) {
        setState(() {
          _error = kLocationErrorGeneric;
          _loading = false;
        });
      }
    }
  }

  String _formatPlacemark(Placemark p) {
    final parts = <String>[];
    final street = [
      p.street,
      p.subThoroughfare,
      p.thoroughfare,
    ]
        .whereType<String>()
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    if (street.isNotEmpty) {
      parts.add(street.join(' '));
    } else {
      if (p.name != null && p.name!.trim().isNotEmpty) {
        parts.add(p.name!);
      }
    }
    if (p.subLocality != null && p.subLocality!.isNotEmpty) {
      parts.add(p.subLocality!);
    }
    final city = p.locality ?? p.subAdministrativeArea;
    if (city != null && city.isNotEmpty) {
      parts.add(city);
    }
    if (p.postalCode != null && p.postalCode!.isNotEmpty) {
      parts.add('C.P. ${p.postalCode}');
    }
    if (p.administrativeArea != null && p.administrativeArea!.isNotEmpty) {
      parts.add(p.administrativeArea!);
    }
    if (p.country != null && p.country!.isNotEmpty) {
      parts.add(p.country!);
    }
    if (parts.isEmpty) {
      return kLocationAddressFallback;
    }
    return parts.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.theme;
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 8),
        child: Center(
          child: SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(strokeWidth: 2.5),
          ),
        ),
      );
    }
    if (_error != null) {
      return Text(
        _error!,
        style: t.textTheme.bodyLarge?.copyWith(
          color: t.colorScheme.error,
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _LocationPreviewRow(
          t: t,
          label: 'Escaneado en',
          value: _addressLine ?? '—',
        ),
        const SizedBox(height: 20),
        _LocationPreviewRow(
          t: t,
          label: 'Coordenadas',
          value: _latLongLine ?? '—',
        ),
      ],
    );
  }
}

class _LocationPreviewRow extends StatelessWidget {
  const _LocationPreviewRow({
    required this.t,
    required this.label,
    required this.value,
  });

  final ThemeData t;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
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
        SelectableText(
          value,
          style: t.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.w500,
            height: 1.35,
          ),
        ),
      ],
    );
  }
}
