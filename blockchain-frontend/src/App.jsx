import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';
import FileStorageABI from './FileStorageABI.json';

const contractAddress = '0x45EfDEE16B8915f58386a354fB945dd2d98FD196';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  async function connectWallet() {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.BrowserProvider(window.ethereum);
    } else {
      alert('MetaMask not found');
    }
  }

  async function uploadFile() {
    const provider = await connectWallet();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, FileStorageABI, signer);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setStatus('Uploading to IPFS...');
      const { data } = await axios.post('http://localhost:3001/upload', formData);
      setIpfsHash(data.ipfsHash);

      setStatus('Storing on Blockchain...');
      const tx = await contract.uploadFile(data.ipfsHash);
      await tx.wait();

      setStatus(`File Uploaded: ${data.ipfsHash}`);
    } catch (err) {
      console.error(err);
      setStatus('Upload failed');
    }
  }

  return (
    <div>
      <h1>Blockchain File Storage</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload File</button>
      <p>{status}</p>
      {ipfsHash && <p>IPFS Hash: {ipfsHash}</p>}
    </div>
  );
}

export default App;
