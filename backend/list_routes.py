import requests
try:
    res = requests.get("http://localhost:8000/openapi.json")
    print(list(res.json()["paths"].keys()))
except Exception as e:
    print(e)
