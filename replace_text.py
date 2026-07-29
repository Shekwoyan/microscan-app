import os

file_path = "src/App.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "Microscopic Blood Smear <br />Classification Platform.": "Quick and Easy Blood Smear <br />Analysis.",
    "A streamlined computer vision utility engineered to assist technicians with instant, automated cell screening inside resource-constrained environments.": "A simple tool to help clinics and technicians quickly screen blood cells without needing an internet connection or expensive equipment.",
    "Launch Analyzer Engine": "Start Scanning",
    "Analyzer &rarr;": "Scan &rarr;",
    "Review Architecture Specs": "How It Works",
    "Technical Specifications & Architecture": "How It Works",
    "Core Engine": "The Brain",
    "MobileNetV2 CNN Architecture": "Smart Image Recognition",
    "Utilizes streamlined inverted residuals and linear bottlenecks to extract high-density visual biomarkers from blood smear samples without heavy computation layers.": "MCNN uses a lightweight image recognition model to scan and identify cells in your blood smear images accurately and quickly.",
    "Operational Integrity": "Privacy & Speed",
    "100% Zero-Connectivity Runtime": "Works Completely Offline",
    "The trained model compiles directly into client-side code. It executes fully offline, ensuring operational stability in rural clinics with compromised network access.": "Everything runs directly on your computer or phone. Your data never leaves your device, and you don't even need an internet connection.",
    "Resource Footprint": "Accessibility",
    "Low Compute / Lightweight Build": "Runs on Any Device",
    "Stripped of heavy frameworks and server dependencies. Smooth deployment on legacy machines, budget tablets, and low-tier hardware variants.": "You don't need a supercomputer. MCNN is built to run smoothly on older laptops, tablets, and basic clinic computers.",
    "Performance Vector": "Results",
    "Optimized Confidence Output": "Clear, Simple Results",
    "Engineered to deliver clear diagnostic support by returning discrete probability arrays instantly on processing.": "Instead of confusing numbers, the system gives you a simple positive or negative result along with how confident it is.",
    "Local Execution Context": "Secure Offline Scan",
    "Micrograph Classifier Pipeline": "Image Scanner",
    "Load microscopic smears to trigger client-side classification weight mapping.": "Upload a blood smear image to scan it.",
    "Processing Node Tensor Arrays...": "Scanning Image...",
    "Analysis Parameters": "Scan Results",
    "Awaiting sample payload. Load a micrograph variant to populate diagnostic tracking output blocks.": "Waiting for an image. Please upload a blood smear to see results.",
    "Detected Classification": "Result",
    "Model Accuracy Score": "Confidence Score",
    "INFERENCE SPEED:": "TIME TAKEN:",
    "ARCHITECTURE MATCH: MobileNetV2 Edge Engine": "MODEL: MobileNetV2",
    "Clear Matrix & Rescan Sample": "Clear and Scan Another Image",
    "System Artifacts": "Downloads",
    "Platform Downloads": "Get the App",
    "Access local binaries and raw weight matrices for offline operation. Choose the appropriate package for your deployment environment.": "Download the app to your computer or phone so you can use it entirely offline.",
    "Full standalone application with bundled runtime and UI for clinical workstations.": "The full app for Windows laptops and desktop computers.",
    "Lightweight mobile application optimized for tablets and edge devices in the field.": "The mobile app designed specifically for Android phones and tablets.",
    "TensorFlow / PyTorch": "For Developers",
    "Raw Model Weights": "Model Code",
    "Direct access to the trained MobileNetV2 architecture weights for custom integrations.": "Download the actual AI model files if you want to use it in your own projects.",
    "Microscan Engine": "MCNN",
    "Engineered to assist technicians with instant cell screening in resource-constrained clinics.": "A simple tool to help clinics screen blood smears offline.",
    "About System": "About",
    "MobileNetV2 Edge Compute Verified": "Works Offline"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Text replaced successfully!")
