import tensorflow as tf
import os

print("Loading model...")
model = tf.keras.models.load_model('mcnn_mobilenetv2_final_enhanced.keras')
print("Converting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with open('mcnn.tflite', 'wb') as f:
    f.write(tflite_model)
    
print("Successfully saved mcnn.tflite!")
