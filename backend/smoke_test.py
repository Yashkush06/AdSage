import urllib.request, json, time
time.sleep(2)
urls = [
    "http://localhost:8000/",
    "http://localhost:8000/health",
    "http://localhost:8000/api/analytics/overview",
    "http://localhost:8000/api/analytics/summary",
    "http://localhost:8000/api/analytics/scheduler/status",
    "http://localhost:8000/api/approvals",
    "http://localhost:8000/api/approvals/stats",
    "http://localhost:8000/api/approvals/history",
    "http://localhost:8000/api/campaigns",
]
for url in urls:
    path = url.replace("http://localhost:8000", "") or "/"
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            data = json.loads(r.read())
            print(f"  OK  {path}")
    except Exception as e:
        print(f" ERR  {path}  => {e}")
