
import React, { useState, useEffect } from 'react';   
import { supabase } from '../supabase';
import axios from 'axios';

const SpeechToText = () => {
  const [recordings, setRecordings] = useState([]);
  const [transcriptions, setTranscriptions] = useState([]);
  const [sentiments, setSentiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ASSEMBLY_AI_API_KEY = '05be3a0eb00d422ab91486f9590684c0'; // Replace with your AssemblyAI API key

  // Fetch recordings from Supabase bucket
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true); // Start loading
        const { data, error } = await supabase.storage
          .from('new')
          .list('', { limit: 100 });

        if (error) {
          console.error('Error fetching recordings:', error);
          setError('Failed to fetch recordings');
        } else if (data && data.length > 0) {
          // Filter out any placeholder files
          const validRecordings = data.filter(file => file.name !== '.emptyFolderPlaceholder');

          // Sort the recordings by created_at in descending order
          const sortedData = validRecordings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecordings(sortedData);
        } else {
          console.log('No recordings found.');
        }
      } catch (err) {
        console.error('Error fetching recordings:', err);
        setError('Error fetching recordings');
      } finally {
        setLoading(false); // Set loading to false after fetching completes
      }
    };

    fetchRecordings();
  }, []);

  // Get the public URL for an audio recording
  const getPublicUrl = (fileName) => {
    const { data } = supabase.storage.from('new').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  // Transcribe audio and get sentiment analysis from AssemblyAI
  const transcribeAndAnalyzeSentiment = async (audioUrl) => {
    try {
      // Step 1: Request transcription and sentiment analysis from AssemblyAI
      const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl, // The public URL of the audio file
          sentiment_analysis: true // Enable sentiment analysis
        },
        {
          headers: {
            authorization: ASSEMBLY_AI_API_KEY,
            'content-type': 'application/json',
          },
        }
      );

      const transcriptId = response.data.id;

      // Step 2: Poll for the transcription and sentiment result
      const pollTranscription = async () => {
        try {
          const { data } = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            {
              headers: {
                authorization: ASSEMBLY_AI_API_KEY,
              },
            }
          );

          if (data.status === 'completed') {
            return {
              transcription: data.text,
              sentiment: data.sentiment_analysis_results
            };
          } else if (data.status === 'failed') {
            throw new Error('Transcription failed');
          } else {
            console.log('Waiting for transcription and sentiment analysis...');
            return null; // Return null if not completed, will keep polling
          }
        } catch (err) {
          console.error('Error during transcription polling:', err);
          throw new Error('Error during transcription polling');
        }
      };

      let result = null;
      while (result === null) {
        result = await pollTranscription();
        if (result === null) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before polling again
        }
      }

      return result;
    } catch (err) {
      console.error('Error during transcription and sentiment analysis:', err);
      throw err;
    }
  };

  // Handle transcription and sentiment analysis for each recording
  const handleTranscribeAndAnalyzeSentiment = async () => {
    setLoading(true);
    const transcriptionResults = [];
    const sentimentResults = [];

    for (let i = 0; i < recordings.length; i++) {
      const publicUrl = getPublicUrl(recordings[i].name);
      try {
        const { transcription, sentiment } = await transcribeAndAnalyzeSentiment(publicUrl);
        
        transcriptionResults.push({ transcription });
        
        // Extract and format sentiment analysis results
        const sentimentSummary = sentiment
          .map(item => `${item.sentiment} (${item.confidence.toFixed(2)})`)
          .join(', ');
        
        sentimentResults.push({ sentiment: sentimentSummary });
      } catch (err) {
        console.error('Error processing recording:', err);
        transcriptionResults.push({ transcription: 'Error' });
        sentimentResults.push({ sentiment: 'Error' });
      }
    }

    // Update the state after processing all recordings
    setTranscriptions(transcriptionResults);
    setSentiments(sentimentResults);
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Speech-to-Text with Sentiment Analysis</h2>

      <button onClick={handleTranscribeAndAnalyzeSentiment} disabled={loading}>
        {loading ? 'Processing...' : 'Start Processing'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recordings.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Recording</th>
              <th>Transcription</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {recordings.map((recording, index) => (
              <tr key={recording.name}>
                <td>
                  <audio controls>
                    <source src={getPublicUrl(recording.name)} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                </td>
                <td>{transcriptions[index]?.transcription || 'Pending'}</td>
                <td>{sentiments[index]?.sentiment || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loading && <p className="loading">Processing recordings...</p>}
    </div>
  );
};

export default SpeechToText;
