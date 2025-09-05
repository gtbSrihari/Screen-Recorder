# 🎥 Screen Recorder App  

A simple **screen recording web app** with a **React frontend** and an **Express + SQLite backend**.  
Users can record their screen, preview the video, download it locally, or upload it to the backend where all recordings are listed.  

---
## Feel the live app here
Screen Recorder - [Link](https://screen-recorder-mern.netlify.app/) 

## 🚀 Features  

- Record your screen with microphone audio (up to 3 minutes).  
- Live timer during recording.  
- Preview the recording before saving.  
- Download your recording as a `.webm` file.  
- Upload to backend and view all recordings.  
- Backend stores video metadata in **SQLite**.  

---

## 🛠️ Setup Instructions (Run Locally)  

### 1. Clone the repository  
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Start the backend
```bash
cd backend
npm install
node server.js
```
➡️ Backend runs at: http://localhost:5000

### 3. Start the frontend
```bash
cd frontend
npm install
npm start
```

➡️ Frontend runs at: http://localhost:3000

### 4. Use the app

1. Open the frontend in your browser.  
2. Click **Start Recording** → record your screen.  
3. Click **Stop Recording** → preview appears.  
4. Choose to **Download** or **Upload** the recording.  
5. Uploaded recordings appear in the **Uploaded Recordings** list.  


## 🌐 Deployment
- Frontend → Deploy on **Netlify** or **Vercel**.  
- Backend → Deploy on **Render** or **Railway**.  


⚠️ Deploying Note:

Update the frontend API_URL in App.js (currently http://localhost:5000) to your deployed backend URL.

⚠️ Known Limitations
- Free hosting (e.g., Render free tier) does not persist uploaded files after restart.  
- SQLite is used locally; for production, PostgreSQL/MySQL is recommended.  
- Recording is limited to 3 minutes (auto-stops after that).  
  


🤝 Contributing

Pull requests are welcome! 🚀  
If you’d like to add features (e.g., cloud storage for uploaded videos),  feel free to fork and submit a PR.  


📜 License

This project is licensed under the MIT License – feel free to use it however you like.
