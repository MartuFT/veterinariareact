import React, { useState } from 'react';
import './MiComponente.css';

function MiComponente() {
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handlePetSizeSelect = (size) => {
    setSelectedPetSize(size);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
      setProgress(0);
      setShowResult(false);
    }
  };

  const handleAnalyze = () => {
    if (!selectedPetSize) {
      alert('Por favor selecciona el tamaño del paciente');
      return;
    }
    
    setProgress(0);
    setShowResult(false);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setShowResult(true);
      }
    }, 200);
  };

  const handleDownload = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de VeterinarIA", 20, 30);
    doc.setFontSize(12);
    doc.text(
      "El análisis de la imagen indica signos compatibles con enfermedad canina. \n\nSe recomienda seguimiento veterinario especializado para confirmar el diagnóstico.",
      20,
      50
    );
    doc.save("Resultado-VeterinarIA.pdf");
  };

  return (
    <div className="veterinaria-app">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-placeholder">V</div>
          <span className="logo-text">VETERINAR<span className="logo-ia">IA</span></span>
        </div>
        <div className="tagline">
          ¡Facilita la interpretación de ecografías!
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="main-instruction">
          Clickea la opción que más se asemeje al paciente.
        </h1>

        {/* Pet Size Selection */}
        <div className="pet-size-selection">
          <button 
            className={`pet-size-btn ${selectedPetSize === 'small' ? 'selected' : ''}`}
            onClick={() => handlePetSizeSelect('small')}
          >
            Perro pequeño/Gato
          </button>
          <button 
            className={`pet-size-btn ${selectedPetSize === 'medium' ? 'selected' : ''}`}
            onClick={() => handlePetSizeSelect('medium')}
          >
            Perro mediano
          </button>
          <button 
            className={`pet-size-btn ${selectedPetSize === 'large' ? 'selected' : ''}`}
            onClick={() => handlePetSizeSelect('large')}
          >
            Perro grande
          </button>
        </div>

        {/* File Upload */}
        <div className="file-upload-section">
          <input 
            type="file" 
            id="fileInput" 
            accept="image/*" 
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-input-label">
            Seleccionar imagen de ecografía
          </label>
          {file && <img src={file} alt="preview" className="preview" />}
        </div>

        {/* Analyze Button */}
        <button 
          className="analyze-btn" 
          onClick={handleAnalyze}
          disabled={!selectedPetSize || !file}
        >
          Analizar
        </button>

        {/* Progress */}
        {progress > 0 && progress < 100 && (
          <div
            className="circular-progress"
            style={{ background: `conic-gradient(#4d5bf9 ${progress * 3.6}deg, #cadcff ${progress * 3.6}deg)` }}
          >
            <span>{progress}%</span>
          </div>
        )}
      </main>

      {/* Results */}
      {showResult && (
        <div className="resultado">
          <div className="resultado-container">
            <h2>Resultado</h2>
            <div className="caja-ia">
              <button className="button descargar" onClick={handleDownload}>
                Descargar resultado en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiComponente;
