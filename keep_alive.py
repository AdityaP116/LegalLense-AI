import time
import requests
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("KeepAliveBot")

# URLs to keep awake
URLS = [
    "https://legallense-ai.onrender.com/health",
    "https://legallense-ai-1.onrender.com/"
]

# Ping interval in seconds (25 seconds as requested)
PING_INTERVAL = 25

def ping_urls():
    logger.info("Starting bot activity instance. Pinging every %d seconds...", PING_INTERVAL)
    while True:
        for url in URLS:
            try:
                start_time = time.time()
                response = requests.get(url, timeout=10)
                elapsed = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    logger.info(f"SUCCESS: Pinged {url} (Status: {response.status_code}, {elapsed:.0f}ms)")
                else:
                    logger.warning(f"WARNING: Pinged {url} (Status: {response.status_code}, {elapsed:.0f}ms)")
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"ERROR: Failed to ping {url} - {str(e)}")
        
        # Wait for the specified delay before the next ping cycle
        time.sleep(PING_INTERVAL)

if __name__ == "__main__":
    try:
        ping_urls()
    except KeyboardInterrupt:
        logger.info("Bot activity instance stopped by user.")
