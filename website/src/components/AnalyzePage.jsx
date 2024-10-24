

import React, { useEffect, useState } from 'react';  
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'; // Import BarChart components
import './AnalyzePage.css'; // Separate CSS for styling

const AnalyzePage = () => {
  const { state } = useLocation();
  const { audioUrl } = state || {};
  const [transcription, setTranscription] = useState('');
  const [generatedSentimentSummary, setGeneratedSentimentSummary] = useState('');
  const [sentimentDetails, setSentimentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const ASSEMBLY_AI_API_KEY = '05be3a0eb00d422ab91486f9590684c0'; // Replace with your AssemblyAI API key

  useEffect(() => {
    if (!audioUrl) return;

    const transcribeAndAnalyzeSentiment = async () => {
      try {
        const response = await axios.post(
          'https://api.assemblyai.com/v2/transcript',
          {
            audio_url: audioUrl, // The public URL of the audio file
            sentiment_analysis: true, // Enable sentiment analysis
          },
          {
            headers: {
              authorization: ASSEMBLY_AI_API_KEY,
              'content-type': 'application/json',
            },
          }
        );

        const transcriptId = response.data.id;

        const pollTranscription = async () => {
          const { data } = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            {
              headers: {
                authorization: ASSEMBLY_AI_API_KEY,
              },
            }
          );

          console.log('Transcription data:', data);  // Debugging: Check what data is returned

          if (data.status === 'completed') {
            setTranscription(data.text);

            if (data.sentiment_analysis_results && data.sentiment_analysis_results.length > 0) {
              const sentiments = data.sentiment_analysis_results.map(item => ({
                sentiment: item.sentiment,
                confidence: item.confidence.toFixed(2),
                text: item.text,
              }));

              setSentimentDetails(sentiments);
              generateOverallSentimentSummary(sentiments);  // Generate the overall sentiment based on individual sentiments
            } else {
              console.warn('No sentiment data returned');  // Debugging: Warn if no sentiment data
              setGeneratedSentimentSummary('No sentiment data available for analysis.');
            }
            setLoading(false);
            return true;  // Mark as completed
          } else if (data.status === 'failed') {
            setTranscription('Transcription failed');
            setGeneratedSentimentSummary('Sentiment analysis failed');
            setLoading(false);
            return true;  // Mark as failed to stop polling
          }

          return false;  // Keep polling
        };

        let completed = false;
        while (!completed) {
          completed = await pollTranscription();
          if (!completed) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before polling again
          }
        }
      } catch (err) {
        setLoading(false);
        console.error('Error during transcription and sentiment analysis:', err);
      }
    };

    transcribeAndAnalyzeSentiment();
  }, [audioUrl]);

  const generateOverallSentimentSummary = (sentiments) => {
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    sentiments.forEach(item => {
      if (item.sentiment === 'POSITIVE') positiveCount++;
      if (item.sentiment === 'NEGATIVE') negativeCount++;
      if (item.sentiment === 'NEUTRAL') neutralCount++;
    });

    const totalSentiments = positiveCount + negativeCount + neutralCount;

    if (totalSentiments === 0) {
      setGeneratedSentimentSummary('No sentiment data available for analysis.');
      return;
    }

    const positiveThreshold = 0.15; // e.g., 15% positive sentiments
    const negativeThreshold = 0.15; // e.g., 15% negative sentiments

    let summary = 'The AI-generated analysis reveals that the employee’s conversation had ';

    if (positiveCount / totalSentiments > positiveThreshold) {
      summary += 'a predominantly positive tone. The employee showed politeness, empathy, and a professional way of communicating with the customer. ';
    } else if (negativeCount / totalSentiments > negativeThreshold) {
      summary += 'a somewhat negative tone. There were instances where the employee’s responses may have been perceived as assertive or less empathetic. ';
    } else {
      summary += 'a neutral tone. While the employee remained professional, the interaction lacked noticeable positive or negative shifts in tone. ';
    }

    summary += 'The overall demeanor suggests ';
    if (positiveCount > negativeCount) {
      summary += 'a positive customer service approach, enhancing the overall experience for the customer.';
    } else if (negativeCount > positiveCount) {
      summary += 'a need for improvement in tone, possibly affecting the customer’s satisfaction during the interaction.';
    } else {
      summary += 'a balanced communication style, although it may benefit from more warmth or empathy.';
    }

    summary += `\n\nSentiment Breakdown: \n- Positive: ${positiveCount} \n- Negative: ${negativeCount} \n- Neutral: ${neutralCount}`;

    setGeneratedSentimentSummary(summary);
  };

  // Prepare data for the chart
  const chartData = [
    { name: 'Positive', value: sentimentDetails.filter(item => item.sentiment === 'POSITIVE').length },
    { name: 'Negative', value: sentimentDetails.filter(item => item.sentiment === 'NEGATIVE').length },
    { name: 'Neutral', value: sentimentDetails.filter(item => item.sentiment === 'NEUTRAL').length },
  ];

  // Score data for the BarChart
  const scoreData = [
    { name: 'Positive Score', score: chartData[0].value },
    { name: 'Negative Score', score: chartData[1].value },
    { name: 'Neutral Score', score: chartData[2].value },
  ];

  return (
    <div className="analyze-container">
      <h2>Employee-Customer Conversation Analysis</h2>
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p className="loading-message">AI is working...</p>
        </div>
      ) : (
        <div className="chat-output">
          <div className="ai-response">
            <div className="message">
              <strong>AI:</strong> <p className="ai-message">{generatedSentimentSummary}</p>
            </div>

            <div className="transcript-section">
              <h3>Transcription:</h3>
              <p className='message'>{transcription}</p>
            </div>

            <h3>Sentiment Distribution:</h3>
            <div className="chart-container">
              <ResponsiveContainer width="50%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#4caf50', '#f44336', '#ffeb3b'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="50%" height={300}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="sentiment-details">
              <h3>Sentiment Breakdown:</h3>
              {sentimentDetails.map((item, index) => (
                <div key={index} className={`sentiment-item ${item.sentiment}`}>
                  <p><strong>{item.sentiment}</strong> – {item.text}</p>
                  <span className="confidence-score">Confidence: {item.confidence}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzePage;








