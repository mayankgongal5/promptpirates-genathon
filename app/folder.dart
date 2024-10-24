import 'dart:io';

import 'package:Dialytics/supabase.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class FolderContentPage extends StatefulWidget {
  final Directory folder;

  FolderContentPage({required this.folder});

  @override
  _FolderContentPageState createState() => _FolderContentPageState();
}

class _FolderContentPageState extends State<FolderContentPage> {
  List<FileSystemEntity> _files = [];
  Set<String> _uploadedFiles = Set<String>();

  @override
  void initState() {
    super.initState();
    _loadFiles();
  }

  Future<void> _loadFiles() async {
    if (widget.folder.existsSync()) {
      _files = await _listFiles(widget.folder);
      setState(() {});
    }
  }

  Future<List<FileSystemEntity>> _listFiles(Directory dir) async {
    List<FileSystemEntity> files = [];
    await for (FileSystemEntity entity in dir.list(recursive: false, followLinks: false)) {
      files.add(entity);
    }
    files.sort((a, b) => b.statSync().modified.compareTo(a.statSync().modified));
    return files;
  }

  Future<void> _uploadFile(FileSystemEntity file) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      throw Exception('User is not authenticated');
    }

    try {
      await uploadFile(file.path);
      setState(() {
        _uploadedFiles.add(file.path);
      });
    } catch (e) {
      print('Upload error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.folder.path.split('/').last),
      ),
      body: _files.isEmpty
          ? Center(child: Text('No files or folders found'))
          : ListView.builder(
        itemCount: _files.length,
        itemBuilder: (context, index) {
          final entity = _files[index];
          return ListTile(
            leading: _uploadedFiles.contains(entity.path)
                ? Icon(Icons.check, color: Colors.green)
                : null,
            title: Text(entity.path.split('/').last),
            trailing: IconButton(
              icon: Icon(Icons.upload),
              onPressed: () => _uploadFile(entity),
            ),
            onTap: () {
              if (entity is Directory) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FolderContentPage(folder: entity),
                  ),
                );
              }
            },
          );
        },
      ),
    );
  }
}