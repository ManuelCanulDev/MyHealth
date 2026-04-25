import 'package:flutter/material.dart';

import 'scan/scan_home.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyHealthApp());
}

class MyHealthApp extends StatelessWidget {
  const MyHealthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MYHEALTH',
      debugShowCheckedModeBanner: false,
      theme: myHealthLightTheme(),
      home: const ScanHomePage(),
    );
  }
}
