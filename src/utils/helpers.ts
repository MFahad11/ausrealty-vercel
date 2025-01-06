export const getSupportedMimeType = () => {
    const types = ['audio/mp4', 'audio/webm', 'audio/ogg'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};
export const convertBlobToBase64 = (blob: Blob) => {
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
