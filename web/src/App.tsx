import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:3010";

function App() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [availableVideos, setAvailableVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/stream/video/list`);
      setAvailableVideos(response.data as string[]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      await axios.post(`${API_URL}/stream/csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("CSV file uploaded successfully!");
      setCsvFile(null);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Error uploading CSV file");
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      await axios.post(`${API_URL}/stream/video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Video uploaded successfully!");
      setVideoFile(null);
      fetchVideos(); // Refresh video list
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video file");
    }
  };

  return (
    <div className="container">
      <h1>File Streaming Demo</h1>

      <div className="upload-section">
        <h2>CSV Upload</h2>
        <form onSubmit={handleCsvUpload}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
          />
          <button type="submit" disabled={!csvFile}>
            Upload CSV
          </button>
        </form>
      </div>

      <div className="upload-section">
        <h2>Video Upload</h2>
        <form onSubmit={handleVideoUpload}>
          <input
            type="file"
            accept=".mp4"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
          <button type="submit" disabled={!videoFile}>
            Upload Video
          </button>
        </form>
      </div>

      <div className="video-section">
        <h2>Available Videos</h2>
        <div className="video-list">
          {availableVideos.map((video) => (
            <div
              key={video}
              className={`video-item ${
                selectedVideo === video ? "selected" : ""
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              {video}
            </div>
          ))}
        </div>

        {selectedVideo && (
          <div className="video-player">
            <h3>Now Playing: {selectedVideo}</h3>
            <video
              controls
              src={`${API_URL}/stream/video/watch/${selectedVideo}`}
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
