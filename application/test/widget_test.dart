import 'package:flutter_test/flutter_test.dart';

import 'package:grupokamar_myhealth/branding/my_health_logo.dart';
import 'package:grupokamar_myhealth/main.dart';

void main() {
  testWidgets('Pantalla inicial con logo MYHEALTH', (WidgetTester tester) async {
    await tester.pumpWidget(const MyHealthApp());
    await tester.pump();

    expect(find.byType(MyHealthLogo), findsWidgets);
    expect(find.textContaining('HEALTH'), findsWidgets);
  });
}
