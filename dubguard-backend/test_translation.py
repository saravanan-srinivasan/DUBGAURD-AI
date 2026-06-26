import asyncio
import os
from app.services.auto_correction import auto_correction_service

text = "Urbanization and the rapid growth of modern cities have completely transformed how human beings interact with their environments, shaping both opportunities and challenges in everyday life. On one hand, living in a bustling metropolis offers unparalleled access to diverse cultures, economic opportunities, and advanced technological infrastructure. However, this dense concentration of people also places a heavy burden on natural resources, often leading to increased pollution, traffic congestion, and a higher cost of living. Consequently, city planners and local governments are constantly forced to innovate. By investing heavily in sustainable public transportation networks, developing green energy grids, and creating expansive public parks, municipalities can successfully balance economic progress with environmental preservation. Ultimately, while the transition to city living presents complex obstacles, it remains one of the most powerful catalysts for global innovation and social development."

def test():
    translated = auto_correction_service.translate_with_llm(text, "ta")
    with open("translated.txt", "w", encoding="utf-8") as f:
        f.write(translated)
    print("LENGTH:", len(translated))

test()
