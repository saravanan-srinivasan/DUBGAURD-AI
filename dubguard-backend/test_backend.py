import asyncio
from app.services.auto_correction import auto_correction_service

async def test():
    path, text = await auto_correction_service.generate_tts(
        "Hello world",
        target_lang="en",
        pitch="0Hz",  # Testing without plus
        rate="0%"     # Testing without plus
    )
    print("Path:", path)

asyncio.run(test())
