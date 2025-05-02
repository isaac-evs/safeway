import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-2')
CLAUDE_MODEL_ID = 'us.anthropic.claude-3-5-haiku-20241022-v1:0'

MAPBOX_ACCESS_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'news_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}

POLLING_INTERVAL = 300
MAX_RETRIES = 3
RETRY_DELAY = 10


RSS_FEEDS = [
    'https://www.reforma.com/rss/portada.xml',
    'https://www.excelsior.com.mx/rss.xml',
    'https://www.milenio.com/rss',
    'https://www.informador.mx/rss/ultimas-noticias.xml',
    'https://www.debate.com.mx/rss/feed.xml',
    'https://heraldodemexico.com.mx/rss/feed.html?r=4'
]

VALID_CATEGORIES = ['crime', 'infrastructure', 'hazard', 'social']
