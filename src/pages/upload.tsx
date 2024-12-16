import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const ImageUploadForm: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select files');
      return;
    }

    setIsUploading(true);
    const urls: string[] = [];

    try {
      // Use Promise.all for concurrent uploads
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        return response.data.fileUrl;
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      setUploadedImageUrls(results);
      setIsUploading(false);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed');
      setIsUploading(false);
    }
  };

  const copyAllUrls = () => {
    navigator.clipboard.writeText(uploadedImageUrls.join('\n'));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-rounded">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="file" 
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        {selectedFiles && selectedFiles.length > 0 && !isUploading && (
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
          </button>
        )}

        {isUploading && (
          <div className="text-center text-blue-600">Uploading...</div>
        )}

        {uploadedImageUrls.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Uploaded URLs:</h3>
              <button 
                type="button"
                onClick={copyAllUrls}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Copy All URLs
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded p-2">
              {uploadedImageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center mb-1 p-1 bg-gray-100 rounded"
                >
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 truncate max-w-[80%]"
                  >
                    {url}
                  </a>
                  <button 
                    type="button"
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ImageUploadForm;