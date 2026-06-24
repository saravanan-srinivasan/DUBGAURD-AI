from gtts import gTTS
import os

print("Generating Original Audio (English)...")
en_text = "Hello, welcome to DubGuard AI. This is a highly advanced intelligent platform for dubbing quality assurance."
tts_en = gTTS(text=en_text, lang='en')
tts_en.save("test_original.mp3")

print("Generating Dubbed Audio (Spanish)...")
# We'll include a slight error in the Spanish text generation to see if the AI catches it!
# Real translation: "Hola, bienvenido a DubGuard AI. Esta es una plataforma inteligente muy avanzada para el aseguramiento de la calidad del doblaje."
# We'll generate something slightly off so we don't get a perfect 100% score everywhere.
es_text = "Hola, bienvenidos a DubGuard. Esta es una plataforma para la calidad del doblaje."
tts_es = gTTS(text=es_text, lang='es')
tts_es.save("test_dubbed.mp3")

print("Audio files generated successfully!")
