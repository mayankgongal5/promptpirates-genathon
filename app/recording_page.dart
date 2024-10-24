// import 'package:flutter/material.dart';
// import 'dart:io';
// import 'package:flutter/services.dart';
// import 'folder.dart';
// import 'supabase.dart';
//
// class RecordingPage extends StatefulWidget {
//   static Future<void> refresh() async {
//     // Add logic to refresh recordings
//   }
//   @override
//   _RecordingPageState createState() => _RecordingPageState();
//
//   static Future<void> uploadRecordingByIndex(int index) async {
//     final audioDirectory = Directory('/storage/emulated/0/Music/Recordings/Call Recordings');
//     if (audioDirectory.existsSync()) {
//       final files = await _listFiles(audioDirectory);
//       if (index < files.length) {
//         final file = files[index];
//         await uploadFile(file.path);
//       }
//     }
//   }
//
//   static Future<List<FileSystemEntity>> _listFiles(Directory dir) async {
//     List<FileSystemEntity> files = [];
//     await for (FileSystemEntity entity in dir.list(recursive: false, followLinks: false)) {
//       files.add(entity);
//     }
//     files.sort((a, b) => b.statSync().modified.compareTo(a.statSync().modified));
//     return files;
//   }
// }
//
// class _RecordingPageState extends State<RecordingPage> {
//   List<FileSystemEntity> _files = [];
//   static const MethodChannel _channel = MethodChannel('myapp/channel');
//   Set<String> _uploadedFiles = Set<String>();
//
//   @override
//   void initState() {
//     super.initState();
//     _loadFiles();
//   }
//
//   Future<void> _loadFiles() async {
//     final audioDirectory = Directory('/storage/emulated/0/Music/Recordings/Call Recordings');
//     if (audioDirectory.existsSync()) {
//       _files = await RecordingPage._listFiles(audioDirectory);
//       setState(() {});
//     }
//   }
//
//   Future<void> _requestFilesAccessPermission() async {
//     try {
//       await _channel.invokeMethod('requestFilesAccessPermission');
//     } on PlatformException catch (e) {
//       print("Failed to request permission: '${e.message}'.");
//     }
//   }
//
//   Future<void> _uploadFile(FileSystemEntity file) async {
//     try {
//       await uploadFile(file.path);
//       setState(() {
//         _uploadedFiles.add(file.path);
//       });
//     } catch (e) {
//       print('Upload error: $e');
//     }
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Column(
//         children: [
//           Expanded(
//             child: _files.isEmpty
//                 ? Center(child: Text('No files or folders found'))
//                 : ListView.builder(
//               itemCount: _files.length,
//               itemBuilder: (context, index) {
//                 final entity = _files[index];
//                 return Card(
//                   margin: EdgeInsets.all(8.0),
//                   child: ListTile(
//                     leading: Column(
//                       mainAxisAlignment: MainAxisAlignment.center,
//                       children: [
//                         Text('${index + 1}'),
//                         Icon(Icons.record_voice_over, color: Colors.green,), // Display the index number
//                       ],
//                     ),
//                     title: Text(entity.path.split('/').last),
//                     subtitle: Text('Modified: ${entity.statSync().modified}'),
//                     trailing: _uploadedFiles.contains(entity.path)
//                         ? Icon(Icons.check, color: Colors.green)
//                         : IconButton(
//                       icon: Icon(Icons.upload),
//                       onPressed: () => _uploadFile(entity),
//                     ),
//                     onTap: () {
//                       if (entity is Directory) {
//                         Navigator.push(
//                           context,
//                           MaterialPageRoute(
//                             builder: (context) => FolderContentPage(folder: entity),
//                           ),
//                         );
//                       }
//                     },
//                   ),
//                 );
//               },
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'dart:io';
import 'package:flutter/services.dart';
import 'folder.dart';
import 'supabase.dart';
import 'package:audioplayers/audioplayers.dart';

class RecordingPage extends StatefulWidget {
  static Future<void> refresh() async {
    // Add logic to refresh recordings
  }

  @override
  _RecordingPageState createState() => _RecordingPageState();

  static Future<void> uploadRecordingByIndex(int index) async {
    final audioDirectory = Directory('/storage/emulated/0/Music/Recordings/Call Recordings');
    if (audioDirectory.existsSync()) {
      final files = await _listFiles(audioDirectory);
      if (index < files.length) {
        final file = files[index];
        await uploadFile(file.path);
      }
    }
  }

  static Future<List<FileSystemEntity>> _listFiles(Directory dir) async {
    List<FileSystemEntity> files = [];
    await for (FileSystemEntity entity in dir.list(recursive: false, followLinks: false)) {
      files.add(entity);
    }
    files.sort((a, b) => b.statSync().modified.compareTo(a.statSync().modified));
    return files;
  }
}

class _RecordingPageState extends State<RecordingPage> {
  List<FileSystemEntity> _files = [];
  static const MethodChannel _channel = MethodChannel('myapp/channel');
  Set<String> _uploadedFiles = Set<String>();

  AudioPlayer _audioPlayer = AudioPlayer();
  String? _currentlyPlayingFile;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _loadFiles();
  }

  Future<void> _loadFiles() async {
    final audioDirectory = Directory('/storage/emulated/0/Music/Recordings/Call Recordings');
    if (audioDirectory.existsSync()) {
      _files = await RecordingPage._listFiles(audioDirectory);
      setState(() {});
    }
  }

  Future<void> _requestFilesAccessPermission() async {
    try {
      await _channel.invokeMethod('requestFilesAccessPermission');
    } on PlatformException catch (e) {
      print("Failed to request permission: '${e.message}'.");
    }
  }

  Future<void> _uploadFile(FileSystemEntity file) async {
    try {
      await uploadFile(file.path);
      setState(() {
        _uploadedFiles.add(file.path);
      });
    } catch (e) {
      print('Upload error: $e');
    }
  }

  Future<void> _togglePlayPause(String filePath) async {
    if (_isPlaying && _currentlyPlayingFile == filePath) {
      // Pause the audio if it is currently playing
      await _audioPlayer.pause();
      setState(() {
        _isPlaying = false;
      });
    } else {
      // Play the audio if it's not playing or if a new file is tapped
      if (_currentlyPlayingFile != filePath) {
        await _audioPlayer.stop();
        _currentlyPlayingFile = filePath;
      }
      await _audioPlayer.play(DeviceFileSource(filePath));
      setState(() {
        _isPlaying = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: _files.isEmpty
                ? Center(child: Text('No files or folders found'))
                : ListView.builder(
              itemCount: _files.length,
              itemBuilder: (context, index) {
                final entity = _files[index];
                return Card(
                  margin: EdgeInsets.all(8.0),
                  child: ListTile(
                    leading: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('${index + 1}'),
                        Icon(
                          Icons.record_voice_over,
                          color: Colors.green,
                        ), // Display the index number
                      ],
                    ),
                    title: Text(entity.path.split('/').last),
                    subtitle: Text('Modified: ${entity.statSync().modified}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: Icon(
                            _isPlaying && _currentlyPlayingFile == entity.path
                                ? Icons.pause
                                : Icons.play_arrow,
                          ),
                          onPressed: () => _togglePlayPause(entity.path), // Toggle play/pause
                        ),
                        _uploadedFiles.contains(entity.path)
                            ? Icon(Icons.check, color: Colors.green)
                            : IconButton(
                          icon: Icon(Icons.upload),
                          onPressed: () => _uploadFile(entity),
                        ),
                      ],
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
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}