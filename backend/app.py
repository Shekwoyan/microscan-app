import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import keras

from slicer import analyze_smear

import sys

# Determine if running in a PyInstaller bundle
if getattr(sys, 'frozen', False):
    application_path = sys._MEIPASS
else:
    application_path = os.path.dirname(os.path.abspath(__file__))

static_dir = os.path.join(application_path, 'dist')
app = Flask(__name__, static_folder=static_dir, static_url_path='/')
CORS(app)  # Enable CORS for frontend integration

# Load the model globally so it's ready for requests
MODEL_PATH = os.path.join(application_path, 'malaria_model_v1.keras')
print(f"Loading model from {MODEL_PATH}...")
try:
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

import numpy as np

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

@app.route('/predict-smear', methods=['POST'])
def predict_smear():
    if model is None:
        return jsonify({"error": "Model is not loaded on the server."}), 500
        
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        # Read the image file using Pillow
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Run the Hacky Color Gatekeeper
        if not is_likely_blood_smear(image):
            return jsonify({"error": "Image rejected: Color profile does not match a Giemsa-stained blood smear."}), 400
        
        # Pass the image to our slicer
        result = analyze_smear(image, model)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
