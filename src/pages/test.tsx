import React, { useState, useRef } from 'react';
import OpenAI from 'openai';


const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Function to get suitable mime type for the browser
  const getMimeType = () => {
    const types = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/m4a',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm'; // Fallback
  };

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      const mimeType = getMimeType();
      console.log('Using MIME type:', mimeType);
    //   @ts-ignore
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
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
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
      };

      // Set a time slice to get data more frequently (every 250ms)
    //   @ts-ignore

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(`Failed to start recording. Please make sure you have granted microphone permissions. ${JSON.stringify(error)}`);
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

  const processAudio = async (audioBlob:any) => {
    setIsProcessing(true);
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.m4a');
      
      // Step 1: Transcribe audio
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: new File([audioBlob], 'audio.m4a', { type: audioBlob.type }),
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
    //   @ts-ignore

      setResponse(gptResponse);

      // Step 3: Convert response to speech
      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
    //   @ts-ignore

        input: gptResponse,
      });

      // Convert the speech response to audio URL and play it
      const blob = new Blob([await speechResponse.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      // Clean up the URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      // Play the audio
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          setError(`Failed to play audio. Please check your device settings. ${JSON.stringify(error)}`);
        }
      };
      playAudio();

    } catch (error) {
      console.error('Error processing audio:', error);
      setError(`An error occurred while processing your audio. Please try again. ${JSON.stringify(error)}`);
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