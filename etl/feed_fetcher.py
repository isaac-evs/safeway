import feedparser
import asyncio
import logging
import time
from datetime import datetime
import aiohttp
from config import RSS_FEEDS, POLLING_INTERVAL, MAX_RETRIES, RETRY_DELAY

logger = logging.getLogger(__name__)

class FeedFetcher:
    def __init__(self, db):
        self.feeds = RSS_FEEDS
        self.db = db
        self.processed_urls = set()
        self.session = None

    async def initialize(self):
        self.session = aiohttp.ClientSession()
        self.processed_urls = self.db.get_processed_urls()
        logger.info(f"Initialized feed fetcher with {len(self.processed_urls)} existing articles")

    async def close(self):
        if self.session:
            await self.session.close()

    async def fetch_feed(self, feed_url):
        for attempt in range(MAX_RETRIES):
            try:
                async with self.session.get(feed_url, timeout=30) as response:
                    if response.status == 200:
                        content = await response.text()
                        return feedparser.parse(content)
                    else:
                        logger.warning(f"Failed to fetch feed {feed_url}, status code: {response.status}")
            except Exception as e:
                logger.error(f"Error fetching feed {feed_url}: {e}")

            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_DELAY)

        logger.error(f"Failed to fetch feed after {MAX_RETRIES} attempts: {feed_url}")
        return None

    async def fetch_all_feeds(self):
        tasks = [self.fetch_feed(feed) for feed in self.feeds]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        new_articles = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Exception fetching feed {self.feeds[i]}: {result}")
                continue

            if not result:
                continue

            feed_source = self.feeds[i]
            source_name = result.feed.title if hasattr(result.feed, 'title') else feed_source

            for entry in result.entries:
                article = self._parse_entry(entry, source_name)
                if article and article['url'] not in self.processed_urls:
                    new_articles.append(article)
                    self.processed_urls.add(article['url'])

        logger.info(f"Fetched {len(new_articles)} new articles")
        return new_articles

    def _parse_entry(self, entry, source_name):
        try:
            url = entry.link if hasattr(entry, 'link') else None
            if not url:
                return None

            published = None
            for date_field in ['published', 'pubDate', 'updated']:
                if hasattr(entry, date_field):
                    try:
                        date_str = getattr(entry, date_field)
                        struct_time = getattr(entry, f"{date_field}_parsed", None)
                        if struct_time:
                            published = datetime(*struct_time[:6]).date()
                        else:
                            for fmt in ["%a, %d %b %Y %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z"]:
                                try:
                                    published = datetime.strptime(date_str, fmt).date()
                                    break
                                except ValueError:
                                    continue
                    except Exception:
                        pass

                    if published:
                        break

            if not published:
                published = datetime.now().date()

            title = entry.title if hasattr(entry, 'title') else None
            description = None

            for desc_field in ['description', 'summary', 'content']:
                if hasattr(entry, desc_field):
                    description = getattr(entry, desc_field)
                    break

            if not title or not description:
                return None

            if isinstance(description, list):
                content_value = ""
                for item in description:
                    if isinstance(item, dict) and 'value' in item:
                        content_value += item['value']
                description = content_value if content_value else str(description)

            return {
                'news_source': source_name,
                'title': title,
                'description': description,
                'url': url,
                'date': published
            }
        except Exception as e:
            logger.error(f"Error parsing RSS entry: {e}")
            return None

    async def poll_feeds_continuously(self, article_queue):
        try:
            await self.initialize()

            while True:
                try:
                    new_articles = await self.fetch_all_feeds()
                    for article in new_articles:
                        await article_queue.put(article)

                    logger.info(f"Added {len(new_articles)} articles to processing queue")
                    await asyncio.sleep(POLLING_INTERVAL)
                except Exception as e:
                    logger.error(f"Error in feed polling cycle: {e}")
                    await asyncio.sleep(RETRY_DELAY)
        finally:
            await self.close()
