from app.core.config import settings
from app.core.logging import logger
import logging

def test_settings_loaded():
    assert settings.PROJECT_NAME == "DubGuard AI"
    assert settings.API_V1_STR == "/api/v1"

def test_logger_setup():
    assert logger.name == "dubguard"
    assert logger.level == logging.INFO
