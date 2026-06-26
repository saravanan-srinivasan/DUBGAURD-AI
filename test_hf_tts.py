import requests
import time

url = "https://shravan2020-dubguard-backend.hf.space/api/v1/test-tts"

for _ in range(10):
    try:
        r = requests.get(url)
        if r.status_code == 200:
            print(r.json())
            break
        else:
            print("Status:", r.status_code)
    except Exception as e:
        print("Error:", e)
    time.sleep(5)
