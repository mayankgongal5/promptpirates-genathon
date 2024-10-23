import { useState, useEffect } from 'react';  
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom'; 
import SelectEmployee from '../SelectEmployee';
import './CallLogTable.css';

function CallLogTable() {
  const [callLogs, setCallLogs] = useState([]); 
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [dateFilter, setDateFilter] = useState('all');
  const navigate = useNavigate(); 

  
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('employee');

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        const uniqueEmployees = Array.from(new Set(data.map((log) => log.employee)));
        setEmployees(uniqueEmployees);
      }
    };

    fetchEmployees();
  }, []);

 
  useEffect(() => {
    const fetchCallLogs = async () => {
      if (!selectedEmployee) return;

      let query = supabase
        .from('call_logs')
        .select('*')
        .eq('employee', selectedEmployee)
        .order('upload_timestamp', { ascending: false });

    
      const now = new Date();
      if (dateFilter === 'today') {
        query = query.gte('upload_timestamp', new Date(now.setHours(0, 0, 0, 0)).toISOString());
      } else if (dateFilter === 'week') {
        query = query.gte('upload_timestamp', new Date(now.setDate(now.getDate() - 7)).toISOString());
      } else if (dateFilter === 'month') {
        query = query.gte('upload_timestamp', new Date(now.setMonth(now.getMonth() - 1)).toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching call logs:', error);
      } else {
        setCallLogs(data);
      }
    };

    fetchCallLogs();
  }, [selectedEmployee, dateFilter]);


  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true); 
        const { data, error } = await supabase
          .storage
          .from('callrec')
          .list('', { limit: 100 });

        if (error) {
          console.error('Error fetching recordings:', error);
        } else if (data && data.length > 0) {
          const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecordings(sortedData);
        } else {
          console.log('No recordings found.');
        }
      } catch (err) {
        console.error('Error fetching recordings:', err);
      } finally {
        setLoading(false); 
      }
    };

    fetchRecordings();
  }, []);

  const getPublicUrl = (fileName) => {
    const { data } = supabase.storage.from('callrec').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  const handleAnalyze = (recordingName) => {
    const audioUrl = getPublicUrl(recordingName);
    navigate('/analyze', { state: { audioUrl } }); 
  };

 
  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; 
  };

 
  const filteredCallLogs = callLogs.filter((call) => 
    call.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.number.toString().includes(searchQuery)
  );

  return (
    <div className="container">
      <h2>Call Logs</h2>
  
      <SelectEmployee employees={employees} onSelectEmployee={setSelectedEmployee} />

      {/* Only show the search and filter when an employee is selected */}
      {selectedEmployee && (
        <>
          <div className="filters-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by customer or number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="date-filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>

          <table>
  <thead>
    <tr>
      <th>#</th> {/* Serial Number Column */}
      <th>Customer</th>
      <th>Number</th>
      <th>Duration</th>
      <th>Timestamp</th>
      <th>Call Type</th>
      <th>Recording</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredCallLogs.map((call, index) => (
      <tr key={call.id}>
        <td data-label="Serial Number">{index + 1}</td> {/* Serial Number */}
        <td data-label="Customer">{call.customer}</td>
        <td data-label="Number">{call.number}</td>
        <td data-label="Duration">{formatDuration(call.duration)}</td>
        {/* <td data-label="Timestamp">{call.timestamp}</td> */}
        <td data-label="Timestamp">
  {new Date(call.timestamp).toISOString().slice(0, 19).replace('T', ' ')}
</td>

        <td data-label="Call Type">
          {call.call_type === 'incoming' ? (
            <span className="incoming-call">▲ {call.call_type}</span>
          ) : (
            <span className="outgoing-call">▼ {call.call_type}</span>
          )}
        </td>
        <td data-label="Recording">
          {recordings.length > 0 && recordings[index]?.name ? (
            <audio controls>
              <source src={getPublicUrl(recordings[index].name)} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <span>No Recording</span>
          )}
        </td>
        <td data-label="Actions">
          {recordings.length > 0 && recordings[index]?.name ? (
            <button className="analyze-button" onClick={() => handleAnalyze(recordings[index].name)}>
              Analyze
            </button>
          ) : (
            <span>No Recording</span>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

        </>
      )}

      {loading && <p className="loading">Loading recordings...</p>}
    </div>
  ); 
}

export default CallLogTable;









