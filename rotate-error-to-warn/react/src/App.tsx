import { useState, useCallback } from 'react';
import VideoCapture from './components/VideoCapture';

function App() {
  const [bScan, setBScan] = useState(false);
  const switchScan = useCallback(()=>{
    setBScan(!bScan);
  },[bScan]);
  return (
    <>
      <button onClick={switchScan}>{bScan?'stop':'start'} scan</button>
      {bScan && <VideoCapture />}
    </>
  );
}

export default App;
