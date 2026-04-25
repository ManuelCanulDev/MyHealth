import 'package:flutter/material.dart';

import 'my_health_brand.dart';

/// Marca vectorial: squircle con gradiente, línea ECG nítida y «MY» + «HEALTH» en itálica.
/// Versión mejorada respecto al PNG: bordes más suaves, gradiente y sombra ligeros.
class MyHealthLogo extends StatelessWidget {
  const MyHealthLogo({
    super.key,
    this.height = 40,
    this.compact = false,
  });

  final double height;
  /// Solo el icono (útil en espacios reducidos).
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final iconSize = height;
    final fontSize = height * 0.58;
    final baseStyle = TextStyle(
      fontSize: fontSize,
      fontWeight: FontWeight.w800,
      fontStyle: FontStyle.italic,
      height: 1,
      letterSpacing: 0.3,
    );

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: iconSize,
          height: iconSize,
          child: CustomPaint(
            painter: _MyHealthMarkPainter(),
          ),
        ),
        if (!compact) ...[
          SizedBox(width: height * 0.18),
          Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: 'MY',
                  style: baseStyle.copyWith(color: MyHealthBrand.textDark),
                ),
                TextSpan(
                  text: 'HEALTH',
                  style: baseStyle.copyWith(color: MyHealthBrand.pink),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _MyHealthMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final r = w * 0.24;
    final rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, w, h),
      Radius.circular(r),
    );

    final path = Path()..addRRect(rect);
    canvas.drawShadow(
      path,
      Colors.black.withValues(alpha: 0.22),
      4,
      false,
    );

    final fill = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          MyHealthBrand.pinkLight,
          MyHealthBrand.pink,
          MyHealthBrand.pinkDeep,
        ],
        stops: [0.0, 0.45, 1.0],
      ).createShader(Rect.fromLTWH(0, 0, w, h));
    canvas.drawRRect(rect, fill);

    final y = h * 0.52;
    final ecg = Path()
      ..moveTo(w * 0.10, y)
      ..lineTo(w * 0.20, y)
      ..lineTo(w * 0.24, y - h * 0.05)
      ..lineTo(w * 0.28, y + h * 0.04)
      ..lineTo(w * 0.32, y - h * 0.32)
      ..lineTo(w * 0.36, y + h * 0.28)
      ..lineTo(w * 0.40, y)
      ..lineTo(w * 0.90, y);

    final stroke = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.052
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(ecg, stroke);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
