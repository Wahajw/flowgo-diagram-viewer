import React, { useState } from "react";
import axios from "axios";
import mermaid from "mermaid";

function App() {
  const [file, setFile] = useState(null);
  const [diagram, setDiagram] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDiagram(response.data.diagram);
      setTimeout(() => mermaid.contentLoaded(), 100); // Render Mermaid diagram
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="App">
      <h1>Flowgo Diagram Viewer</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Generate Diagram</button>

      <div className="diagram-container">
        {diagram && <div className="mermaid">{diagram}</div>}
      </div>
    </div>
  );
}

export default App;
