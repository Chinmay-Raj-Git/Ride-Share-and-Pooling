import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {

    fetch("/api/hello")
      .then(res => res.text())
      .then(data => setMessage(data));

  }, []);

  return (
    <div className='font-[Roboto]'>
      <h1>RideShare Platform</h1>
      <p>{message}</p>

      
    </div>
  )
}

export default App
