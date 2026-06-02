import requests
import os

api_url = "https://api.example.com/chat"
api_key = os.getenv("MY_CHAT_API_KEY")
if not api_key:
    raise ValueError("Missing MY_CHAT_API_KEY")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}",
}
payload = {
    "model": "chat-model",
    "messages": [
        {"role": "user", "content": "Hello!"}
    ]
}

try:
    response = requests.post(api_url, headers = headers, json = payload, timeout = 15)
    response.raise_for_status()
    data = response.json()
    print(data)
except requests.exceptions.HTTPError as http_err:
    print(f"HTTP error occurred: {http_err}")
    print(f"Response body: {response.text}")
except requests.exceptions.RequestException as req_err:
    print(f"Request error occurred: {req_err}")
except Exception as e:
    print (f"An unexpected error occurred: {e}")

