import numpy as np
from PIL import Image

def slice_image(image: Image.Image, patch_size=(224, 224)):
    """
    Slices a large image into smaller patches of `patch_size`.
    Returns a numpy array of patches and their grid coordinates.
    """
    # Ensure RGB
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    width, height = image.size
    p_w, p_h = patch_size
    
    patches = []
    
    for y in range(0, height, p_h):
        for x in range(0, width, p_w):
            # If the patch goes beyond the image boundaries, we pad it with black pixels
            # or just crop it to the patch size. Let's create a black patch and paste the crop.
            box = (x, y, min(x + p_w, width), min(y + p_h, height))
            crop = image.crop(box)
            
            if crop.size != patch_size:
                padded = Image.new("RGB", patch_size, (0, 0, 0))
                padded.paste(crop, (0, 0))
                patches.append(np.array(padded))
            else:
                patches.append(np.array(crop))
                
    if not patches:
        return np.empty((0, p_h, p_w, 3))
        
    # Convert to numpy array and scale to [0, 1]
    patches_arr = np.array(patches, dtype=np.float32) / 255.0
    return patches_arr

def analyze_smear(image: Image.Image, model):
    """
    Slices the image, runs model predictions, and determines
    the highest confidence score and whether it's positive.
    """
    patches = slice_image(image)
    
    if patches.shape[0] == 0:
        return {
            "status": "negative",
            "confidence": 0.0,
            "error": "Image too small or invalid"
        }
        
    # Batch predict
    # Model output is (None, 1) representing probability of being positive
    predictions = model.predict(patches, batch_size=16, verbose=0)
    
    # We take the maximum probability as the confidence that the smear has a parasite
    max_prob = float(np.max(predictions))
    
    # Threshold for positive is > 0.5
    is_positive = max_prob > 0.5
    
    return {
        "status": "positive" if is_positive else "negative",
        "confidence": round(max_prob * 100, 2)  # Return as percentage
    }
