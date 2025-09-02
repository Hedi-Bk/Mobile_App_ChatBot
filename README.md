# 📱 AI Product Tracking App

## 🚀 Description

This mobile application enables **tracking and managing physical products** using AI.

It combines **object detection from captured images**, document scanning (invoices, receipts), and **data cross-checking** to simplify inventory and stock management.

The system is designed for two types of users:

- **Regular User**: can register, track, and manage their products within the platform.
- **Administrator**: has access to an **AI-powered RAG chatbot** that allows querying user data via prompts, without directly accessing Appwrite or the database.

---

## 🛠️ Tech Stack

- **Frontend**: React Native (accessible via Expo Go).
- **Backend**: Flask (API).
- **Authentication & Database**: Appwrite.
- **AI Provider**: OpenRouter (free models available with an API key).
- **Ngrok**: tunnel to expose Flask API locally. _(⚠️ The URL changes with every restart)_.

---

## 📂 Project Structure

```
project/
│── app.py               # Main Flask backend file
│── wsgi.py              # Server entry point
│── requirements.txt      # Python dependencies
│── yolov8n.pt            # AI model for detection
│── /APIs                 # Flask API endpoints
│── /Mobile_Chatbot          # Mobile application (React Native)

```

---

## 🔑 Key Features

### 👤 Regular User

- Authentication via Appwrite.
- Register products with image capture.
- Track registered products in their personal account.

### 🛡️ Administrator

- Exclusive access via email defined in `.env`.
- **RAG-based chatbot** connected to user data.
- Retrieve information using prompts (no need to browse Appwrite or DB directly).

---

## 🎥 Demo

- **Explanatory video & demo**: [Google Drive Link](https://drive.google.com/file/d/1UhIrXfExn-oqhP0nkRbwlG81I7cN1KIL/view?usp=drive_link)

---

## ⚙️ Installation & Run

### 🔹 Prerequisites

- Node.js & npm
- Expo Go (on mobile)
- Python 3.8+
- Appwrite account
- OpenRouter API key

### 🔹 Backend (Flask + Ngrok)

```bash
pip install -r requirements.txt
python wsgi.py

```

👉 Ngrok generates a temporary URL: `https://xxxx.ngrok-free.app`

### 🔹 Frontend (React Native)

```bash
cd application
npm install
npx expo --tunnel start

```

👉 Scan the QR code with Expo Go to run the app.

---

## ⚠️ Important Notes

- Update the `.env` file with your own Appwrite credentials and **ADMIN_EMAIL**.
- Provide a valid OpenRouter API key to enable AI functionalities.
- Ngrok URL must be updated each time the server restarts.
- **Deployment phase** (backend hosting + Play Store publishing) is not yet a priority.

---

## 📌 Roadmap (Future Enhancements)

- Permanent backend deployment (Railway, Render, or AWS).
- Enhanced admin chatbot (support for more AI models).
- APK generation and Google Play Store publishing.
- UI/UX optimization for the mobile app.

---

## 👨‍💻 Author

Developed by **Hedi-Bk**

- Backend: Flask + Appwrite
- Frontend: React Native (Expo)
- AI: OpenRouter + YOLOv8 model
