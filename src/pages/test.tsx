'use client';

import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

import dynamic from 'next/dynamic';

// Dynamically import audio recorder with no SSR
const AudioRecorder = dynamic(() => import('audio-recorder-polyfill'), {
  ssr: false
});

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Set up client-side only code
  useEffect(() => {
    setIsClient(true);
    
    // Initialize AudioRecorder polyfill
    if (typeof window !== 'undefined' && !window.MediaRecorder) {
    //   @ts-ignore

      import('audio-recorder-polyfill/mpeg-encoder').then((mpegEncoder) => {
    //   @ts-ignore

        AudioRecorder.encoder = mpegEncoder.default;
        AudioRecorder.prototype.mimeType = 'audio/mpeg';
    //   @ts-ignore

        window.MediaRecorder = AudioRecorder;
      });
    }

    // Initialize AudioContext
    //   @ts-ignore

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
    //   @ts-ignore

      audioContextRef.current = new AudioContext();
    }

    return () => {
      if (audioContextRef.current) {
    //   @ts-ignore

        audioContextRef.current.close();

      }
    };
  }, []);

  // Convert blob to WAV format
    //   @ts-ignore

  const convertToWav = async (audioBlob) => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    //   @ts-ignore

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels;
    const wavBuffer = audioContext.createBuffer(numberOfChannels, length, audioBuffer.sampleRate);
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      wavBuffer.copyToChannel(channelData, channel);
    }

    // Convert to WAV using a blob URL instead of a Web Worker
    const wavData = new Float32Array(length);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = wavBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        wavData[i] += channelData[i];
      }
    }

    const buffer = new ArrayBuffer(44 + wavData.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    //   @ts-ignore

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + wavData.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2 * numberOfChannels, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, wavData.length * 2, true);

    // Write audio data
    for (let i = 0; i < wavData.length; i++) {
      const sample = Math.max(-1, Math.min(1, wavData[i]));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    return new File([buffer], 'audio.wav', { type: 'audio/wav' });
  };

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
    //   @ts-ignore
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mpeg'
      });
      
      audioChunksRef.current = [];
    //   @ts-ignore

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
    //   @ts-ignore

          audioChunksRef.current.push(event.data);
        }
      };
    //   @ts-ignore

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
    //   @ts-ignore

          type: mediaRecorderRef.current.mimeType 
        });
        await processAudio(audioBlob);
      };
    //   @ts-ignore

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(`Failed to start recording. Please make sure you have granted microphone permissions.${JSON.stringify(error)}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
    //   @ts-ignore

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    //   @ts-ignore

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
    //   @ts-ignore

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const wavFile = await convertToWav(audioBlob);
      
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: wavFile,
        model: 'whisper-1',
      });

      const transcribedText = transcriptionResponse.text;
      setTranscription(transcribedText);

      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: transcribedText }],
      });

      const gptResponse = chatResponse.choices[0].message.content;
    //   @ts-ignore
      setResponse(gptResponse);

      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
    //   @ts-ignore

        input: gptResponse,
      });

      const blob = new Blob([await speechResponse.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();

    } catch (error) {
      console.error('Error processing audio:', error);
      setError(`An error occurred while processing your audio. Please try again.${JSON.stringify(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div>
        <div>Voice Chat Assistant</div>
      </div>
      <div className="space-y-4">
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {isProcessing && (
          <div className="text-center text-gray-500">Processing your audio...</div>
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