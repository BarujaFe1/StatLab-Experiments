import json
import urllib.request

urls = [
    "https://statlab-experiments-api.vercel.app/api/health",
    "https://statlab-experiments-api.vercel.app/api/scenarios",
    "https://statlab-ab.vercel.app/api/health",
]
for url in urls:
    try:
        with urllib.request.urlopen(url, timeout=25) as r:
            body = r.read().decode("utf-8")
            print(url, r.status, body[:180].replace("\n", " "))
    except Exception as e:
        print(url, "FAIL", e)

payload = json.dumps(
    {
        "visitors_a": 10000,
        "conversions_a": 500,
        "visitors_b": 10000,
        "conversions_b": 580,
        "alpha": 0.05,
        "n_comparisons": 3,
        "mpe": 0.005,
    }
).encode()
req = urllib.request.Request(
    "https://statlab-ab.vercel.app/api/analyze",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))
        print(
            "analyze",
            data.get("status"),
            "practical=",
            data.get("practically_significant"),
            "next_steps=",
            len(data.get("next_steps") or []),
        )
except Exception as e:
    print("analyze FAIL", e)
