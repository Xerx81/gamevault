import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')
TWITCH_CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET')
IGDB_BASE_URL = 'https://api.igdb.com/v4'

# Basic memory cache for the token
# Note: In a massive production app, you'd store this in Redis or your DB with its expiration time
_access_token = None

def get_twitch_token():
    global _access_token
    if _access_token:
        return _access_token

    auth_url = 'https://id.twitch.tv/oauth2/token'
    params = {
        'client_id': TWITCH_CLIENT_ID,
        'client_secret': TWITCH_CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }
    
    response = requests.post(auth_url, params=params)
    response.raise_for_status() # Throws an error if auth fails
    
    _access_token = response.json().get('access_token')
    return _access_token

def search_games(query_string):
    token = get_twitch_token()
    
    headers = {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': f'Bearer {token}'
    }
    
    # IGDB uses a custom query language called Apicalypse
    # We are asking for the game's name, cover image ID, and release date
    body = f'search "{query_string}"; fields name, cover.image_id, first_release_date; limit 10;'
    
    response = requests.post(f'{IGDB_BASE_URL}/games', headers=headers, data=body)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch from IGDB", "details": response.text}
