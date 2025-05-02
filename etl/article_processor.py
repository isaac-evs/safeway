import boto3
import json
import logging
import asyncio
from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, CLAUDE_MODEL_ID, VALID_CATEGORIES

logger = logging.getLogger(__name__)

class ArticleProcessor:
    def __init__(self):
        self.bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        logger.info("Initialized ArticleProcessor with Claude via AWS Bedrock")

    async def classify_article(self, article):
        """Classify article using Claude"""
        prompt = f"""
        You are an expert in analyzing news articles from Mexico. Your task is to categorize the following news article into one of these categories: crime, infrastructure, hazard (e.g., weather alerts, fires, natural disasters), or social (e.g., political unrest, protests).

        If the article doesn't clearly fit into any of these categories, respond with "DISCARD".

        News Title: {article['title']}
        News Content: {article['description']}

        Return only the category name (crime, infrastructure, hazard, social) or "DISCARD" without any additional text.
        """

        try:
            category = await self._invoke_claude(prompt)
            category = category.strip().lower()

            if category not in VALID_CATEGORIES:
                logger.info(f"Article discarded - invalid category: {category}")
                return None

            article['type'] = category
            return article
        except Exception as e:
            logger.error(f"Error classifying article: {e}")
            return None

    async def extract_location(self, article):
        """Extract specific location from article using Claude"""
        prompt = f"""
        You are an expert in analyzing news articles from Mexico. Your task is to extract the most specific location mentioned in the following news article.

        The location should be as specific as possible (e.g., street, neighborhood, city, or state in Mexico).

        If multiple locations are mentioned, extract the main or most relevant one.
        If no clear location in Mexico is mentioned, respond with "NO_LOCATION".

        News Title: {article['title']}
        News Content: {article['description']}

        Return only the location name without any additional text.
        """

        try:
            location = await self._invoke_claude(prompt)
            location = location.strip()

            if location == "NO_LOCATION":
                logger.info(f"Article discarded - no location extracted: {article['title']}")
                return None

            if not "mexico" in location.lower() and not "méxico" in location.lower():
                location += ", Mexico"

            article['location'] = location
            return article
        except Exception as e:
            logger.error(f"Error extracting location: {e}")
            return None

    async def _invoke_claude(self, prompt):
        """Invoke Claude model via AWS Bedrock"""
        loop = asyncio.get_event_loop()

        def _call_bedrock():
            request = {
                "prompt": f"\n\nHuman: {prompt}\n\nAssistant:",
                "max_tokens_to_sample": 500,
                "temperature": 0,
                "top_p": 0.9,
                "stop_sequences": ["\n\nHuman:"]
            }

            response = self.bedrock_runtime.invoke_model(
                modelId=CLAUDE_MODEL_ID,
                body=json.dumps(request)
            )

            response_body = json.loads(response['body'].read())
            return response_body['completion'].strip()

        return await loop.run_in_executor(None, _call_bedrock)

    async def process_articles(self, article_queue, geocoder, db):
        """Process articles from the queue"""
        while True:
            article = await article_queue.get()
            try:
                # Step 1: Classify the article
                classified_article = await self.classify_article(article)
                if not classified_article:
                    article_queue.task_done()
                    continue

                # Step 2: Extract location
                article_with_location = await self.extract_location(classified_article)
                if not article_with_location:
                    article_queue.task_done()
                    continue

                # Step 3: Geocode the location
                geocoded_article = await geocoder.geocode_location(article_with_location)
                if not geocoded_article:
                    article_queue.task_done()
                    continue

                # Step 4: Store in database
                db.insert_article(geocoded_article)
                logger.info(f"Successfully processed article: {article['title']}")
            except Exception as e:
                logger.error(f"Error processing article: {e}")
            finally:
                article_queue.task_done()
