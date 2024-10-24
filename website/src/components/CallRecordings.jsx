
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SelectEmployee from './SelectEmployee';

function CallLogTable() {
  const [callLogs, setCallLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch distinct employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('employee'); // Fetch employees

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        const uniqueEmployees = Array.from(new Set(data.map((log) => log.employee)));
        setEmployees(uniqueEmployees);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch call logs for the selected employee
  useEffect(() => {
    const fetchCallLogs = async () => {
      if (!selectedEmployee) return;

      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('employee', selectedEmployee)
        .order('upload_timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching call logs:', error);
      } else {
        setCallLogs(data);
      }
    };

    fetchCallLogs();
  }, [selectedEmployee]);

  // Fetch recordings from storage
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true); // Start loading
        const { data, error } = await supabase
          .storage
          .from('callrec')
          .list('', { limit: 100 });

        if (error) {
          console.error('Error fetching recordings:', error);
        } else if (data && data.length > 0) {
          // Sort the recordings by created_at in descending order
          const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecordings(sortedData);
        } else {
          console.log('No recordings found.');
        }
      } catch (err) {
        console.error('Error fetching recordings:', err);
      } finally {
        setLoading(false); // Set loading to false after fetching completes
      }
    };

    fetchRecordings();
  }, []);

  // Get the public URL for the audio recording
  const getPublicUrl = (fileName) => {
    const { data } = supabase.storage.from('callrec').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  return (
    <div style={styles.container}>
      <h2>Call Logs</h2>
      
      {/* Employee Selection Dropdown */}
      <SelectEmployee employees={employees} onSelectEmployee={setSelectedEmployee} />

      {selectedEmployee && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Number</th>
              <th>Duration (s)</th>
              <th>Timestamp</th>
              <th>Recording</th>
            </tr>
          </thead>
          <tbody>
            {callLogs.map((call, index) => (
              <tr key={call.id}>
                <td>{call.id}</td>
                <td>{call.customer}</td>
                <td>{call.number}</td>
                <td>{call.duration}</td>
                <td>{new Date(call.upload_timestamp).toLocaleString()}</td>
                <td>
                  {recordings.length > 0 && recordings[index]?.name ? (
                    <audio controls>
                      <source src={getPublicUrl(recordings[index].name)} type="audio/mpeg" />
                      Your browser does not support the audio tag.
                    </audio>
                  ) : (
                    <span>No Recording</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loading && <p>Loading recordings...</p>}
    </div>
  );
}

const styles = {
  container: {
    marginLeft: '250px',
    marginTop: '80px',
    padding: '20px',
  },
};

export default CallLogTable;





