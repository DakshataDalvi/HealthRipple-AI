import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Simulate from './pages/Simulate';
import PHCNetwork from './pages/PHCNetwork';
import Results from './pages/Results';
import About from './pages/About';

export default function App() {
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All India');
  const [language, setLanguage] = useState('en');

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              language={language}
              setLanguage={setLanguage}
            />
          }
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route
            path="overview"
            element={
              <Overview
                simulationResult={simulationResult}
                setSimulationResult={setSimulationResult}
              />
            }
          />
          <Route
            path="simulate"
            element={
              <Simulate
                simulationResult={simulationResult}
                setSimulationResult={setSimulationResult}
              />
            }
          />
          <Route path="network" element={<PHCNetwork />} />
          <Route path="results" element={<Results simulationResult={simulationResult} setSimulationResult={setSimulationResult} />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
