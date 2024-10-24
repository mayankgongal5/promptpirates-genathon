import 'package:flutter/material.dart';
import 'package:supabase_auth_ui/supabase_auth_ui.dart';
import 'home.dart';
import 'login_page.dart';
import 'package:supabase/supabase.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://sfskqaeauyjqcefzvtmb.supabase.co',
    anonKey: 'iwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyMzNX0.Ya8pb4W-owyvLdTqJXsjrIr03-6JR68IgAF_1M9StK4',
  );

  final session = Supabase.instance.client.auth.currentSession;

  runApp(MyApp(startPage: session == null ? LoginPage() : HomePage()));
}

class MyApp extends StatelessWidget {
  final Widget startPage;

  MyApp({required this.startPage});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Call Log App',
      debugShowCheckedModeBanner: false,
      home: startPage,
    );
  }
}
