import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:io'; // Import File if needed for file paths

Future<void> uploadFile(String filePath) async {
  try {
    final file = File(filePath);
    final fileName = filePath.split('/').last; // Extract the file name from the path
    await Supabase.instance.client.storage
        .from('callrec')
        .upload(fileName, file); // Upload the file

    print('File uploaded successfully');
  } catch (e) {
    throw Exception('Failed to upload file: $e');
  }
}
Future<void> uploadCallLogToDatabase(Map<String, dynamic> callLogData) async {
  // Convert the timestamp from milliseconds to a DateTime object
  if (callLogData.containsKey('timestamp')) {
    // Convert to DateTime
    DateTime dateTime = DateTime.fromMillisecondsSinceEpoch(callLogData['timestamp']);

    // Convert DateTime to ISO 8601 string
    callLogData['timestamp'] = dateTime.toIso8601String();
  }

  final response = await Supabase.instance.client
      .from('call_logs')
      .insert(callLogData);

  if (response.error != null) {
    throw Exception('Failed to upload call log: ${response.error!.message}');
  }
}

Future<bool> isFileUploaded(String filePath) async {
  try {
    final fileName = filePath.split('/').last; // Extract the file name from the path
    final response = await Supabase.instance.client.storage
        .from('callrec')
        .list(path: ''); // List the files in the bucket (root directory)

    if (response.isNotEmpty) {
      for (final file in response) {
        if (file.name == fileName) {
          return true; // File exists in the bucket
        }
      }
    }
    return false; // File not found
  } catch (e) {
    throw Exception('Failed to check if file is uploaded: $e');
  }
}