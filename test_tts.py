import asyncio
import edge_tts

async def test():
    try:
        communicate = edge_tts.Communicate("Hello", "en-US-JennyNeural", pitch="-2Hz", rate="-5%")
        await communicate.save("test.mp3")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
