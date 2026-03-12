
```markdown
# CheXNet-AI: Advanced Chest X-ray Diagnostic System 🩻 🩺

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=000)

🚀 **CheXNet-AI** is a full-stack, decoupled web application that provides real-time diagnostic decision support for thoracic pathologies. It utilizes a fine-tuned **DenseNet-121** 🧠 convolutional neural network to analyze chest radiographs across 14 distinct pathological classes, rendering explainable AI outputs via **Grad-CAM** heatmaps 🌡️ and generating automated clinical PDF reports 📄.

---

## 🏗️ 1. System Architecture & Engineering Decisions 📐

This project implements a scalable, **3-tier microservice architecture** to separate the user interface, API routing, and heavy machine learning inference.

1. 🖥️ **Frontend (Client Tier):** Built with **React 18** and **Vite**, entirely strongly-typed with **TypeScript**. Uses the latest **Tailwind CSS v4** engine for utility-first styling. Features a custom diagnostic dashboard with real-time analytics powered by **Recharts**.
2. ⚙️ **Backend (API/Proxy Tier):** A stateless **FastAPI (Python)** server deployed on Render. It acts as a secure proxy, handling CORS, receiving `FormData` payloads, managing temporary file states (`tempfile`, `shutil`), and securely bridging the frontend to the ML inference engine via the Gradio Client.
3. 🤖 **ML Engine (Inference Tier):** Hosted on **Hugging Face Spaces**. Runs a PyTorch-based DenseNet-121 model. It processes the tensor data, generates gradient-weighted class activation mapping (Grad-CAM) via OpenCV, and utilizes `fpdf` to dynamically compile pixel-perfect clinical reports based on user metadata.

---

## ✨ 2. Core Technical Features 💡

* 📊 **Explainable AI (XAI) Visualization:** Dynamically overlays Grad-CAM heatmaps onto the original radiograph. The frontend features real-time client-side opacity and hue controls for the generated Base64 heatmap.
* 📑 **Dynamic PDF Generation (Server-side):** Replaced client-side PDF rendering with a robust Python `fpdf` implementation on the ML server. It combines the patient metadata (Name, ID, DOB), the original X-ray, the Grad-CAM overlay, and dynamically generated clinical text into a professional Base64-encoded PDF.
* 🛡️ **Type-Safe Data Pipeline:** End-to-end type safety. The nested dictionary data returned by the PyTorch model (`Record<string, number>`) is flattened by FastAPI and strictly mapped to TypeScript interfaces (`AnalysisResult`) for safe local storage and chart rendering.
* 📈 **Persistent Analytics Dashboard:** Computes real-time statistics (Sensitivity, Pathology Frequency) from the user's `localStorage` history using `useMemo` hooks to prevent unnecessary React re-renders.

---

## 🧠 3. Machine Learning Details 🔬

The diagnostic engine is based on the CheXNet architecture.
* 🧮 **Model:** `densenet121`
* 🛠️ **Modifications:** The model's classifier was modified from 1000 classes (ImageNet) to 14 binary classifiers representing pathologies like *Cardiomegaly, Edema, Consolidation, Pneumonia, etc.*
* 🩹 **Monkey Patching:** Implemented a custom `fixed_forward` method using `types.MethodType` to bypass PyTorch in-place ReLU operation errors during backward pass gradients, ensuring stable Grad-CAM extraction from the `norm5` target layer.

---

## 💻 4. Local Installation & Setup ⚙️

### 📋 Prerequisites
* **Node.js** (v18+) 🟢
* **Python** (3.9+) 🐍

### 📥 1. Clone the repository
```bash
git clone [https://github.com/SahidAnkanLayek/Advanced-Chest-X-ray-Diagnostic-System2026.git](https://github.com/SahidAnkanLayek/Advanced-Chest-X-ray-Diagnostic-System2026.git)
cd Advanced-Chest-X-ray-Diagnostic-System2026

```

### 🐍 2. Setup the FastAPI Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

```

### ⚛️ 3. Setup the React Frontend

```bash
cd ../frontend
npm install

```

### 🔐 4. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Point this to your local or deployed FastAPI backend
VITE_API_URL=http://localhost:8000

```

### 🏃 5. Run the Client

```bash
npm run dev

```

---

## 📡 5. API Reference 🌐

### 📨 `POST /predict`

Securely proxies the image and patient metadata to the Hugging Face inference space.

* 📝 **Content-Type:** `multipart/form-data`
* 📦 **Payload:**
* `image`: `File` (Blob)
* `patient_name`: `string`
* `patient_id`: `string`
* `patient_dob`: `string`
* `patient_gender`: `string`


* 📤 **Response:**
* Returns flattened classification probabilities (`Record<string, number>`).
* Returns Base64 encoded strings for both the Grad-CAM visualization and the generated PDF report.



---

## ⚠️ 6. Disclaimer 🛑

*This application is a portfolio project designed to demonstrate full-stack software engineering and machine learning integration skills. It is **not** an FDA-approved medical device and must not be used for actual clinical diagnosis.*

---

👨‍💻 **Developed by Sahid Ankan Layek** • 💻 *Full Stack Software Engineer* • 🔗 [GitHub Profile](https://www.google.com/search?q=https://github.com/SahidAnkanLayek)

```

```
