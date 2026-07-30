import os
import io
import sys
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
import numpy as np

import os
# Suppress TF logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import keras

from preprocess import analyze_smear

# Determine if running in a PyInstaller bundle
if getattr(sys, 'frozen', False):
    application_path = sys._MEIPASS
else:
    application_path = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="Microscan API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model globally so it's ready for requests
MODEL_PATH = os.path.join(application_path, 'mcnn_mobilenetv2_final_enhanced.keras')
print(f"Loading model from {MODEL_PATH}...")
try:
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def is_likely_blood_smear(image: Image.Image) -> bool:
    if image.mode != "RGB":
        image = image.convert("RGB")
    # Resize to a tiny square for ultra-fast color averaging
    small_img = image.resize((50, 50))
    arr = np.array(small_img)
    
    # Calculate average Red, Green, and Blue across the whole image
    avg_color = np.mean(arr, axis=(0, 1))
    r, g, b = avg_color[0], avg_color[1], avg_color[2]
    
    # Filter 1: Too Dark. Microscope slides are brightly backlit.
    if r < 60 and g < 60 and b < 60:
        return False
        
    # Filter 2: Too Green. Giemsa stains are pink/purple/blue, never predominantly green.
    if g > r + 30 and g > b + 30:
        return False
        
    return True

@app.post("/predict-smear")
async def predict_smear(image: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on the server.")
        
    if not image.filename:
        raise HTTPException(status_code=400, detail="No selected file")
        
    try:
        # Read the image file using Pillow
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Run the Hacky Color Gatekeeper (Optional, can be removed if OpenCV pipeline handles it better)
        if not is_likely_blood_smear(pil_image):
            raise HTTPException(status_code=400, detail="Image rejected: Color profile does not match a Giemsa-stained blood smear.")
        
        # Pass the image to our preprocess and analysis logic
        result = analyze_smear(pil_image, model)
        
        return JSONResponse(content=result)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount the static directory to serve the Vite frontend
static_dir = os.path.join(application_path, 'dist')

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_spa(full_path: str):
    # Check if the requested file exists in the static directory
    file_path = os.path.join(static_dir, full_path)
    if os.path.isfile(file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
        
    # Fallback to index.html for React SPA routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.isfile(index_path):
        from fastapi.responses import FileResponse
        return FileResponse(index_path)
        
    raise HTTPException(status_code=404, detail="Not Found")

if __name__ == '__main__':
    import uvicorn
    import os
    # Dynamically detect Render's assigned port, default to 10000
    port = int(os.environ.get("PORT", 10000))
    # Bind to 0.0.0.0 so Render can detect the open port
    uvicorn.run("app:app", host="0.0.0.0", port=port)
