import requests

url = "https://gen.ai.kku.ac.th/okmd/api/v1"

headers = {
    "Content-Type": "application/json",
    "Authorization": "sk_6AbgRr78RL8SeMc7TG9IO8I5yEMqA1Ffve7WhpCxM6OYDTnOg27FkMlkwvykiTF"
}

data = {
    "model": "gemini-2.5-flash-lite",
    "messages": [
        {"role": "user", "content": "hi"}
    ],
    "stream": False
}

response = requests.post(url, json=data, headers=headers)
print("Status Code:", response.status_code)
print("Response:\n", response.text)