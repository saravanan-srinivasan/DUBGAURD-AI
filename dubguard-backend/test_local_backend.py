import asyncio
from app.services.voice_cloning import voice_cloning_service

async def test():
    try:
        print("Starting clone...")
        # create a dummy wav file
        import numpy as np
        from scipy.io import wavfile
        sample_rate = 22050
        t = np.linspace(0, 1, sample_rate)
        data = np.sin(2 * np.pi * 440 * t) * 32767
        data = data.astype(np.int16)
        wav_path = "dummy.wav"
        wavfile.write(wav_path, sample_rate, data)

        res = voice_cloning_service.clone_voice("hello world", wav_path, "en")
        print("Result:", res)
    except Exception as e:
        print("Exception:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
