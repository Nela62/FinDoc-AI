import requests
from app.core.config import settings


def fetch_metrics(company_ticker: str):
    requests.get(
        f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={company_ticker}&apikey={settings.ALPHA_VANTAGE_API_KEY}"
    )
