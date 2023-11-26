import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [apiData, setApiData] = useState();
  useEffect(() => {
    fetch('/api/read')
      .then(res => res.json())
      .then(apiData => setApiData(apiData))
  }, [setApiData]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <h1>Sample Web Page</h1>
        <div class="alert alert-info">
          This page invokes an API to retrieve data.
        </div>

        <div id="data-container">
          <p>Data will be displayed here:</p>
          {apiData}
        </div>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </header>
    </div>
  );
}

export default App;
