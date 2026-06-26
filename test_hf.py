import requests
import numpy as np
from scipy.io import wavfile
import os

# Create dummy audio
sample_rate = 22050
t = np.linspace(0, 1, sample_rate)
data = np.sin(2 * np.pi * 440 * t) * 32767
data = data.astype(np.int16)
wav_path = "dummy.wav"
wavfile.write(wav_path, sample_rate, data)

url = "https://shravan2020-dubguard-backend.hf.space/api/v1/voice-clone"

with open(wav_path, "rb") as f:
    files = {"file": ("dummy.wav", f, "audio/wav")}
    data = {"text": "hello", "language": "en"}
    print("Sending request...")
    response = requests.post(url, files=files, data=data)
    
print("Status Code:", response.status_code)
try:
    print("Response:", response.json())
except Exception as e:
    print("Failed to parse JSON:", response.text)

os.remove(wav_path)
