// upload.js - Node.js Backend for IPFS Upload
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data'; // ✅ Import the correct FormData
dotenv.config();

const app = express();
const upload = multer();

// Upload file to IPFS
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
  
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders?.(), // if using `form-data` package
      },
    });
  
    console.log('Pinata full response:', response.data);
  
    const ipfsHash = response.data?.IpfsHash;
    if (!ipfsHash) {
      return res.status(500).send('Upload succeeded but IpfsHash not found');
    }
  
    res.json({ ipfsHash });
  } catch (err) {
    console.error('Error uploading to IPFS:', err?.response?.data || err.message || err);
    res.status(500).send('Upload failed');
  }
  
});

const port = 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
