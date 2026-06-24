import os
from gtts import gTTS

# Create directory for the test files
output_dir = r"d:\COMPLETED WORKING PROJECTS\TTS PROJECT\tamil_test_files"
os.makedirs(output_dir, exist_ok=True)

# 1. Original English Text
en_text = "Hello, welcome to DubGuard AI. We are building the future of intelligent dubbing to break language barriers."
en_audio_path = os.path.join(output_dir, "english_original.mp3")

tts_en = gTTS(text=en_text, lang='en', slow=False)
tts_en.save(en_audio_path)
print(f"Generated English Original: {en_audio_path}")

# 2. Dubbed Tamil Text (Intentionally missing the second half to trigger Auto-Correction!)
ta_text = "வணக்கம், டப்கார்ட் ஏஐ-க்கு உங்களை வரவேற்கிறோம்."
ta_audio_path = os.path.join(output_dir, "tamil_dubbed.mp3")

tts_ta = gTTS(text=ta_text, lang='ta', slow=False)
tts_ta.save(ta_audio_path)
print(f"Generated Tamil Dub: {ta_audio_path}")

print("\n--- TEXT TO PASTE INTO UI ---")
print("Original Transcript (English):")
print(en_text)
print("\nTranslated Transcript (Tamil):")
print(ta_text)
