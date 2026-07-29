import cv2
import numpy as np
from PIL import Image

def preprocess_image(image: Image.Image, target_size=(224, 224)) -> np.ndarray:
    """
    Preprocesses an image for the MobileNetV2 Keras model using:
    - CLAHE on L-channel
    - Median Filter (blur)
    - Resizing to target_size
    - Normalization [0, 1]
    
    Args:
        image (PIL.Image): The input image.
        target_size (tuple): Target size for the model.
        
    Returns:
        np.ndarray: A preprocessed image array ready for inference (batch dimension added).
    """
    # Ensure RGB
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    # Convert PIL Image to OpenCV format (numpy array in RGB)
    # Note: OpenCV normally uses BGR, but we'll stick to RGB for the whole pipeline 
    # to be consistent with PIL/Keras if the model was trained that way.
    img_array = np.array(image)
    
    # 1. CLAHE Implementation
    # Convert RGB to LAB for histogram equalization on the lightness channel
    lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    
    # Apply CLAHE to L-channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    
    # Merge channels and convert back to RGB
    limg = cv2.merge((cl, a_channel, b_channel))
    enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
    
    # 2. Median Filter
    # Apply median blur to strip away microscopic noise
    filtered_img = cv2.medianBlur(enhanced_img, 3)
    
    # 3. Resize and Format
    # Resize to model's expected input shape
    resized_img = cv2.resize(filtered_img, target_size)
    
    # Cast to float32 (DO NOT divide by 255, the model has an internal Rescaling layer)
    float_img = resized_img.astype(np.float32)
    
    # Add batch dimension: (1, 224, 224, 3)
    batch_img = np.expand_dims(float_img, axis=0)
    
    return batch_img

def analyze_smear(image: Image.Image, model) -> dict:
    """
    Preprocesses the image and runs inference.
    """
    # Preprocess
    processed_input = preprocess_image(image)
    
    # Run prediction
    predictions = model.predict(processed_input, verbose=0)
    
    # Model output is likely (1, 1) representing probability of being positive
    prob = float(np.max(predictions))
    
    is_positive = prob > 0.5
    
    # If the model predicts negative (e.g. prob = 0.1), the confidence it is negative is 90% (1.0 - 0.1)
    final_confidence = prob if is_positive else (1.0 - prob)
    
    return {
        "status": "positive" if is_positive else "negative",
        "confidence": round(final_confidence * 100, 2)
    }
