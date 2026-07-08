import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import keras

try:
    model_path = 'malaria_model_v1.keras'
    model = keras.models.load_model(model_path)
    print("Model Input Shape:", model.input_shape)
    print("Model Output Shape:", model.output_shape)
except Exception as e:
    print("Error loading model:", e)
