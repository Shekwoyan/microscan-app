# Microscan App (MCNN)

A streamlined computer vision utility engineered to assist technicians with instant, automated malaria cell screening inside resource-constrained environments.

## Project Overview

The Microscan App is a full-stack application designed to analyze high-resolution microscopic thin blood smears. Rather than attempting to process massive slides all at once, the system dynamically slices the images into small, highly targeted patches and evaluates them using a highly optimized, locally-running Artificial Intelligence model. 

## System Architecture

The project is split into two primary components to maintain a lightweight footprint:

### 1. Frontend (React + Vite)
- **Framework:** React 19 powered by Vite for instant hot-module replacement and lightning-fast builds.
- **Styling:** Tailwind CSS integrated via PostCSS for a premium, Apple-inspired minimalist design aesthetic.
- **Functionality:** Handles local file uploads, parses them into `FormData`, and pings the local backend API for inference while calculating the exact processing latency.

### 2. Backend (Python + Flask)
- **Framework:** Flask web server running completely locally (100% zero-connectivity runtime support).
- **Core Engine:** TensorFlow & Keras 3.
- **Image Processor (`slicer.py`):** Acts as a digital paper cutter. It chops large, high-resolution microscope slides into a strict grid of `224x224` pixel patches. It then utilizes **Batch Prediction** to feed these patches into the AI model simultaneously for maximum GPU/CPU efficiency.

---

## AI Model Specifications

The core of the classification engine relies on a pre-trained **MobileNetV2 CNN Architecture** (`malaria_model_v1.keras`).

- **Why MobileNetV2?** It utilizes inverted residuals and linear bottlenecks. This allows it to extract high-density visual biomarkers from blood smear samples using significantly less RAM and math operations compared to standard models like ResNet.
- **Classification Method:** The model performs binary classification (Positive / Negative) on individual `224x224` patches. If *any* patch crosses the 50% probability threshold (`max_prob > 0.5`), the entire microscopic smear is flagged as positive for *Plasmodium Falciparum*.

---

## Installation & Setup

You will need two separate terminal windows to run the full stack.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (Windows):
   ```bash
   venv\Scripts\activate.bat
   ```
   *(For PowerShell, use `.\venv\Scripts\Activate.ps1`)*
3. Install all required AI and server dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 2. Frontend Setup
1. Open a second terminal window at the root of the project:
   ```bash
   cd microscan-app
   ```
2. Install the Node packages:
   ```bash
   npm install
   ```

---

## Running the Application

Once everything is installed, follow these steps to launch the system:

**Terminal 1 (Start the Backend Engine):**
```bash
cd backend
venv\Scripts\activate
python app.py
```
*The Flask API will spin up on `http://127.0.0.1:5000` and load the Keras model into memory.*

**Terminal 2 (Start the User Interface):**
```bash
# In the root folder
npm run dev
```
*Vite will start the frontend on `http://localhost:5173/`. Open this link in your browser to access the Micrograph Classifier Pipeline.*

---

## API Reference

### `POST /predict-smear`
Accepts a microscopic smear image, slices it, runs the Tensor arrays, and returns the highest classification confidence.

**Request Body:**
- `image`: (File) A `.jpg` or `.png` image of a blood smear.

**Success Response (200):**
```json
{
  "status": "positive",
  "confidence": 98.74
}
```

**Error Response (400 / 500):**
```json
{
  "error": "Model is not loaded on the server."
}
```
