'use client';

import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Check if running on iOS
  const isIOS = () => {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  };

  useEffect(() => {
    // Request permissions on component mount
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000
          }
        });
        
        // Keep the stream active
        streamRef.current = stream;
        setPermissionGranted(true);
        console.log('Permissions granted successfully');
        
        // Clean up the stream when component unmounts
        return () => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
        };
      } catch (err) {
        console.error('Permission request error:', err);
        setError('Microphone permission is required. Please allow access in your browser settings.');
        setPermissionGranted(false);
      }
    };

    requestPermissions();
  }, []);

  const initializeRecorder = async () => {
    try {
      // If we already have a stream, stop its tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get fresh stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;

      // For debugging
      console.log('Stream created:', stream);
      console.log('Audio tracks:', stream.getAudioTracks());

      // Create MediaRecorder with appropriate MIME type
      const mimeType = isIOS() ? 'audio/mp4' : 'audio/webm';
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });

      console.log('MediaRecorder created:', mediaRecorderRef.current);

      return true;
    } catch (err) {
      console.error('Recorder initialization error:', err);
      setError(`Could not initialize recorder: ${err.message}`);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      
      const initialized = await initializeRecorder();
      if (!initialized) {
        throw new Error('Failed to initialize recorder');
      }

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: isIOS() ? 'audio/mp4' : 'audio/webm'
        });
        await processAudio(audioBlob);
      };

      console.log('Starting recording...');
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      
    } catch (error) {
      console.error('Start recording error:', error);
      setError('Could not start recording. Please refresh the page and try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');
      
      // Create file with appropriate extension for iOS
      const extension = isIOS() ? 'm4a' : 'webm';
      const audioFile = new File([audioBlob], `recording.${extension}`, {
        type: isIOS() ? 'audio/mp4' : 'audio/webm',
        lastModified: new Date().getTime()
      });

      console.log('Created audio file:', audioFile);

      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('file', audioFile);
      
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      const transcribedText = transcriptionResponse.text;
      console.log('Transcribed text:', transcribedText);
      setTranscription(transcribedText);

      // Step 2: Get GPT response
      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: transcribedText }],
      });

      const gptResponse = chatResponse.choices[0].message.content;
      setResponse(gptResponse);

      // Step 3: Convert response to speech
      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: gptResponse,
      });

      const responseBlob = new Blob([await speechResponse.arrayBuffer()], { 
        type: 'audio/mpeg' 
      });
      const audioUrl = URL.createObjectURL(responseBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      try {
        await audio.play();
      } catch (playError) {
        console.error('Playback error:', playError);
        setError('Tap the screen to play the response audio (iOS requirement)');
      }

    } catch (error) {
      console.error('Processing error:', error);
      setError(`Error processing audio: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div>
        <div>Voice Chat Assistant</div>
      </div>
      <div className="space-y-4">
        <div className="text-center mb-4">
          {permissionGranted ? (
            <span className="text-green-600">✓ Microphone access granted</span>
          ) : (
            <span className="text-red-600">⚠ Microphone access needed</span>
          )}
        </div>

        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || !permissionGranted}
          className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {isProcessing && (
          <div className="text-center text-gray-500 p-4">
            Processing your audio...
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {transcription && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Your Message:</h3>
            <p>{transcription}</p>
          </div>
        )}
        
        {response && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Assistant's Response:</h3>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioChat;