import urllib.request
import urllib.error

url = "http://localhost:8000/api/dashboard/extended-stats"
try:
    print(f"Requesting {url}...")
    with urllib.request.urlopen(url) as response:
        status = response.getcode()
        body = response.read().decode('utf-8')
        print(f"STATUS: {status}")
        print(f"BODY length: {len(body)}")
        print(f"BODY preview: {body[:200]}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code} - {e.reason}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"OTHER ERROR: {e}")
