import 'package:flutter/material.dart';
import 'package:call_log/call_log.dart';
import 'package:intl/intl.dart';
import 'package:supabase_auth_ui/supabase_auth_ui.dart';
import 'supabase.dart';

class CallLogPage extends StatefulWidget {
  static Future<void> refresh() async {
    // Add logic to refresh call logs
  }
  @override
  _CallLogPageState createState() => _CallLogPageState();
}

class _CallLogPageState extends State<CallLogPage> {
  Set<String> _uploadedLogs = Set<String>();

  Future<void> _uploadCallLog(CallLogEntry entry) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      print('User is not authenticated');
      return;
    }

    try {
      final callLogData = {
        'customer': entry.name ?? 'Unknown',
        'number': entry.number,
        'duration': entry.duration,
        'timestamp': entry.timestamp,
        'upload_timestamp': DateTime.now().toIso8601String(),
        'employee': user.email,
        'call_type': entry.callType == CallType.incoming ? 'incoming' : 'outgoing',
      };

      await uploadCallLogToDatabase(callLogData);

      setState(() {
        _uploadedLogs.add(entry.number!);
      });
      print('Call log uploaded successfully');
    } catch (e) {
      print('Error during upload: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<Iterable<CallLogEntry>>(
        future: CallLog.get(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else {
            final filteredLogs = snapshot.data!.where((entry) => entry.duration! > 0);
            return ListView.builder(
              itemCount: filteredLogs.length,
              itemBuilder: (context, index) {
                final entry = filteredLogs.elementAt(index);

                DateTime? timestamp = entry.timestamp != null
                    ? DateTime.fromMillisecondsSinceEpoch(entry.timestamp!)
                    : null;

                String formattedDateTime = timestamp != null
                    ? DateFormat.yMd().add_Hms().format(timestamp)
                    : 'N/A';

                Icon callTypeIcon;
                if (entry.callType == CallType.incoming) {
                  callTypeIcon = Icon(Icons.call_received, color: Colors.green);
                } else if (entry.callType == CallType.outgoing) {
                  callTypeIcon = Icon(Icons.call_made, color: Colors.red);
                } else {
                  callTypeIcon = Icon(Icons.call, color: Colors.grey);
                }

                return Card(
                  margin: EdgeInsets.all(8.0),
                  child: ListTile(
                    leading: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('${index + 1}'),
                        callTypeIcon,
                      ],
                    ),
                    title: Text('${entry.name ?? 'Unknown'}: ${entry.number}'),
                    subtitle: Text('$formattedDateTime | ${entry.duration} seconds'),
                    trailing: _uploadedLogs.contains(entry.number)
                        ? Icon(Icons.check, color: Colors.green)
                        : IconButton(
                      icon: Icon(Icons.upload, color: Colors.black),
                      onPressed: () => _uploadCallLog(entry),
                    ),
                  ),
                );
              },
            );
          }
        },
      ),
    );
  }
}