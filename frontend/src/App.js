// frontend/src/App.jsx
import React, { useEffect, useRef, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/recordings`;

export default function App() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [videoURL, setVideoURL] = useState(null);
  const [timer, setTimer] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => { fetchRecordings(); }, []);

  async function fetchRecordings() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRecordings(data);
    } catch (e) { console.error("fetchRecordings err", e); }
  }

  async function startRecording() {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      const tracks = [...displayStream.getVideoTracks(), ...(micStream ? micStream.getAudioTracks() : displayStream.getAudioTracks())];
      const combined = new MediaStream(tracks);

      const mr = new MediaRecorder(combined);
      const localChunks = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) localChunks.push(e.data); };
      mr.onstop = () => {
        setChunks(localChunks);
        const blob = new Blob(localChunks, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        // stop tracks
        combined.getTracks().forEach(t => t.stop());
        displayStream.getTracks().forEach(t => t.stop());
        micStream && micStream.getTracks().forEach(t => t.stop());
      };
      mr.start(250);
      setMediaRecorder(mr);
      setRecording(true);
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t >= 180) { stopRecording(); return t; }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("startRecording err", err);
      alert("Permission denied or unsupported browser. Use Chrome.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    clearInterval(timerRef.current);
    setRecording(false);
  }

  function downloadRecording() {
    if (!videoURL) return;
    const a = document.createElement("a");
    a.href = videoURL;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  }

  async function uploadRecording() {
    if (!chunks || chunks.length === 0) { alert("No recording to upload"); return; }
    const blob = new Blob(chunks, { type: "video/webm" });
    const fd = new FormData();
    fd.append("video", blob, `recording-${Date.now()}.webm`);
    try {
      const res = await fetch(API_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      alert("Upload successful");
      fetchRecordings();
    } catch (e) {
      console.error(e);
      alert("Upload error");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">MERN Screen Recorder</h1>

      <div className="flex items-center justify-center gap-4 mb-4">
        {!recording ? (
          <button onClick={startRecording} className="px-4 py-2 rounded bg-green-600 text-white">Start</button>
        ) : (
          <button onClick={stopRecording} className="px-4 py-2 rounded bg-red-600 text-white">Stop</button>
        )}
        <div className="font-mono">⏱ {Math.floor(timer/60).toString().padStart(2,'0')}:{(timer%60).toString().padStart(2,'0')}</div>
      </div>

      {videoURL && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="font-semibold mb-2">Preview</h2>
          <video src={videoURL} controls className="w-full rounded mb-2" />
          <div className="flex gap-2">
            <button onClick={downloadRecording} className="px-3 py-2 bg-gray-800 text-white rounded">Download</button>
            <button onClick={uploadRecording} className="px-3 py-2 bg-blue-600 text-white rounded">Upload</button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">Uploaded Recordings</h2>
      {recordings.length === 0 ? (
        <p className="text-gray-500">No uploads yet.</p>
      ) : (
        <ul className="space-y-4">
          {recordings.map(r => (
            <li key={r.id} className="p-3 border rounded">
              <div className="flex justify-between items-baseline">
                <div className="font-medium">{r.filename}</div>
                <div className="text-sm text-gray-500">{(r.filesize/1024).toFixed(2)} KB • {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <video src={r.url || `${API_BASE}/api/recordings/${r.id}`} controls className="w-full mt-2 rounded" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
