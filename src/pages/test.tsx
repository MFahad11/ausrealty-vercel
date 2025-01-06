import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [audioError, setAudioError] = useState('');
  const audioChunksRef = useRef([]);
  const silenceTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const checkSilenceRef = useRef<boolean>(false);
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true
  });
  useEffect(() => {
    if (!window.MediaRecorder) {
        // alert('MediaRecorder is not supported in this browser.');
        setLogs((prevLogs) => [...prevLogs, 'MediaRecorder is not supported in this browser.']);
    }
}, []);
const getSupportedMimeType = () => {
    const types = ['audio/mp4', 'audio/webm', 'audio/ogg'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};

const startRecording = async () => {
  try {
    setLogs(prevLogs => [...prevLogs, 'Starting recording setup...']);
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: true,
        sampleRate: 48000,
      },
    });

    setLogs(prevLogs => [...prevLogs, 'Got media stream, setting up audio context...']);
    // @ts-ignore

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    // @ts-ignore

    const source = audioContextRef.current.createMediaStreamSource(stream);
    // @ts-ignore

    analyserRef.current = audioContextRef.current.createAnalyser();
    // @ts-ignore

    analyserRef.current.fftSize = 2048;
    source.connect(analyserRef.current);

    setLogs(prevLogs => [...prevLogs, 'Audio context setup complete']);

    const options = { mimeType: getSupportedMimeType() };
    setLogs((prevLogs) => [...prevLogs, `Using ${options.mimeType} as the recording format.`]);
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

    // Set up silence detection
    // @ts-ignore

    const dataArray = new Float32Array(analyserRef.current.fftSize);
    // @ts-ignore

    let silenceStart = null;
    const SILENCE_DURATION = 2000; // 2 seconds

    const checkSilence = () => {
      if (!checkSilenceRef.current || !analyserRef.current) {
        setLogs(prevLogs => [...prevLogs, 'Silence detection stopped']);
        return;
      }

      try {
        const isSilent = detectSilence(analyserRef.current, dataArray);
        
        if (isSilent) {
    // @ts-ignore

          if (!silenceStart) {
            silenceStart = Date.now();
            setLogs(prevLogs => [...prevLogs, 'Starting silence timer']);
          } else {
            const silenceDuration = Date.now() - silenceStart;
            setLogs(prevLogs => [...prevLogs, `Silence duration: ${silenceDuration}ms`]);
            
            if (silenceDuration > SILENCE_DURATION) {
              setLogs(prevLogs => [...prevLogs, 'Silence duration exceeded, stopping recording']);
              stopRecording();
              return;
            }
          }
        } else {
    // @ts-ignore

          if (silenceStart) {
            setLogs(prevLogs => [...prevLogs, 'Reset silence timer - sound detected']);
          }
          silenceStart = null;
        }
    // @ts-ignore

        silenceTimeoutRef.current = setTimeout(checkSilence, 100);
      } catch (error) {
        setLogs(prevLogs => [...prevLogs, `Error in checkSilence: ${error}`]);
      }
    };

    // Start the recording
    // @ts-ignore

    mediaRecorderRef.current.start(1000);
    
    setIsRecording(true);
    console.log(isRecording)
    checkSilenceRef.current = true; // Start silence detection
    setLogs(prevLogs => [...prevLogs, 'Started recording and silence detection']);
    checkSilence(); // Start the silence detection loop

  } catch (error) {
    setLogs((prevLogs) => [...prevLogs, `Error starting recording: ${error}`]);
    console.error('Error starting recording:', error);
  }
};

const stopRecording = () => {
  setLogs(prevLogs => [...prevLogs, 'Stopping recording...']);
  
  checkSilenceRef.current = false; // Stop silence detection
  console.log(mediaRecorderRef.current , isRecording);
  if (mediaRecorderRef.current) {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      setLogs(prevLogs => [...prevLogs, 'Cleared silence detection timeout']);
    }
    // @ts-ignore
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    // @ts-ignore

    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    
    if (audioContextRef.current) {
    // @ts-ignore

      audioContextRef.current.close().catch(error => {
        setLogs(prevLogs => [...prevLogs, `Error closing audio context: ${error}`]);
      });
    }
    
    mediaRecorderRef.current = null;
    setLogs(prevLogs => [...prevLogs, 'Recording stopped completely']);
  }
};

const detectSilence = (analyser: AnalyserNode, dataArray: Float32Array) => {
  try {
    analyser.getFloatTimeDomainData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const db = 20 * Math.log10(rms);
    
    // Only log every few iterations to avoid flooding
    if (Math.random() < 0.1) { // Log roughly 10% of the readings
      setLogs(prevLogs => [...prevLogs, `Current dB level: ${db.toFixed(2)}`]);
    }
    
    return db < -45;
  } catch (error) {
    setLogs(prevLogs => [...prevLogs, `Error in detectSilence: ${error}`]);
    return false;
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
      // const speechResponse = await openai.audio.speech.create({
      //   model: 'tts-1',
      //   voice: 'alloy',
      //   // @ts-ignore
      //   input: gptResponse,
      // });
  
      // Convert the speech response to audio URL
      // const blob = new Blob([await speechResponse.arrayBuffer()], { type: 'audio/mpeg' });
      // const audioUrl = URL.createObjectURL(blob);
      setAudioUrl('audioUrl');  // Store audio URL in state for playback
  
      // Attempt to autoplay the audio after a slight delay
      setTimeout(() => {
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
          console.error('Autoplay failed, attempting to play audio after user interaction:', error);
          setAudioError('Tap the screen to play the response audio. iOS requirement.');
        });
      }, 100);  // Slight delay to ensure the browser registers the interaction
  
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
        {audioUrl && !audioError && (
        <div>
          <div className="text-center text-gray-500">Audio is ready, playing...</div>
        </div>
      )}

      {audioError && (
        <><div className="text-center text-red-500">{audioError}</div>
        <button
          onClick={() => {
            const audio = new Audio(audioUrl);
            audio.play().catch((error) => {
              console.error('Failed to play audio:', error);
            });
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-2"
        >
          Play Audio
        </button>
        </>
        
      )}

      {logs.length > 0 && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Logs:</h3>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )

          
          }

      </div>
    </div>
  );
};

export default AudioChat;
