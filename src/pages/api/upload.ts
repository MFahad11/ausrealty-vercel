import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';

// Disable bodyParser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

const s3Client = new S3Client({ 
  region: process.env.S3_REGION as string,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY  as string,
  }
});

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Use the parse method directly
    const form = formidable({ 
      keepExtensions: true,
      maxFileSize: 1000 * 1024 * 1024 // 10MB limit
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Upload parse failed', error: err });
      }

      // TypeScript typecasting for files
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      try {
        const fileContent = fs.readFileSync(file.filepath);
        const fileName = `uploads/${uuidv4()}-${file.originalFilename}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: fileContent,
          ContentType: file.mimetype || 'application/octet-stream',
        });

        await s3Client.send(command);

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`;

        res.status(200).json({ fileUrl });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upload failed', error });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
