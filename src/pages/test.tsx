import React, { useState, useRef } from 'react';
import OpenAI from 'openai';

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // For iOS compatibility, we'll use audio/mp4 as the preferred format
      const options = {
        mimeType: 'audio/mp4'
      };

      // If audio/mp4 is not supported, fall back to audio/webm
      if (!MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/webm';
      }
  // @ts-ignore

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
  // @ts-ignore

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
  // @ts-ignore

          audioChunksRef.current.push(event.data);
        }
      };
  // @ts-ignore

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        await processAudio(audioBlob);
      };
  // @ts-ignore

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
  // @ts-ignore

      mediaRecorderRef.current.stop();
      setIsRecording(false);
  // @ts-ignore

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  // @ts-ignore

  const convertBlobToBase64 = (blob) => {
  // @ts-ignore

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
  // @ts-ignore

        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  // @ts-ignore
  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // Convert the audio blob to base64
      const base64Audio = await convertBlobToBase64(audioBlob);

      // Create a new Blob from the base64 data
      const base64Response = await fetch(`data:audio/mp4;base64,${base64Audio}`);
      const processedBlob = await base64Response.blob();

      // Step 1: Transcribe audio using base64
      const formData = new FormData();
      formData.append('file', processedBlob, 'audio.mp4');
      formData.append('model', 'whisper-1');

      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: new File([processedBlob], 'audio.mp4', { 
          type: 'audio/mp4' 
        }),
        model: 'whisper-1',
      });

      const transcribedText = transcriptionResponse.text;
      setTranscription(transcribedText);

      // Step 2: Get GPT response
      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: transcribedText }],
      });

      const gptResponse = chatResponse.choices[0].message.content;
  // @ts-ignore

      setResponse(gptResponse);

      // Step 3: Convert response to speech
      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
  // @ts-ignore

        input: gptResponse,
      });

      // Convert the speech response to audio URL and play it
      const blob = new Blob([await speechResponse.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error processing audio:', error);
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