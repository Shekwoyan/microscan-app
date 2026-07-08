# How to Run Microscan App Locally

Because this application uses a decoupled Client-Server architecture, you need to run **both** the backend Python server and the frontend React development server simultaneously in two separate terminal windows.

---

## 1. Start the Backend (Flask & Machine Learning Engine)

The backend handles the image processing and the TensorFlow machine learning model. It must be running for the scanner to work.

1. **Open your first terminal** and navigate to the backend folder:
   ```powershell
   cd backend
   ```

2. **Activate the Python virtual environment:**
   ```powershell
   .\venv\Scripts\activate
   ```
   *(You should see `(venv)` appear at the beginning of your terminal prompt).*

3. **Install the required Python packages** (you only need to do this once):
   ```powershell
   pip install -r requirements.txt
   ```

4. **Start the Flask server:**
   ```powershell
   python app.py
   ```

> **Important:** The TensorFlow model is quite large. After running `python app.py`, **wait 20 to 30 seconds** for the model to fully load into memory. You will know it is ready when the terminal prints `* Running on http://127.0.0.1:5000`. If you try to use the app before this, you will get a "Connection Error".

---

## 2. Start the Frontend (React UI)

The frontend is the graphical user interface you interact with in your browser.

1. **Open a SECOND, new terminal window** and make sure you are in the root `microscan-app` folder.

2. **Install the Node.js dependencies** (you only need to do this once):
   ```powershell
   npm install
   ```

3. **Start the Vite development server:**
   ```powershell
   npm run dev
   ```

4. **Open the App:**
   Once the server starts, it will give you a local URL (usually `http://localhost:5173/`). Hold `Ctrl` and click that link in your terminal to open the application in your web browser.

---

## Troubleshooting

*   **"Connection Error. Is the backend running?"**
    *   Ensure your backend terminal is still open and running.
    *   Ensure you waited the full 30 seconds for TensorFlow to initialize before clicking upload.
*   **"No image part in the request"**
    *   This is actually a good sign! It means the backend is running, but you sent a blank request. The UI handles this normally.
