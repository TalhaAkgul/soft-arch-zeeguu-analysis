import json
import re


def clean_path(raw_path):
    # Extract main API path from raw path (e.g., remove BASE_URL or ${...})
    match = re.search(r"(?:BASE_URL)?/?([a-zA-Z0-9_/-]+)", raw_path)
    if match:
        path = "/" + match.group(1)
    else:
        path = "/" + raw_path.strip("/")

    # Remove templating/dynamic segments
    path = re.sub(r"/\$\{.*?\}", "", path)
    path = re.sub(r"/:\w+", "", path)  # Remove dynamic params like /:id
    return path


def normalize_method(raw_method):
    raw = raw_method.lower()
    if raw in ("getjson", "get", "apiget", "getplaintext"):
        return "GET"
    if raw in ("post", "post", "apipost", "fetch"):
        return "POST"
    return raw.upper()


# Load detected calls from JavaScript output
with open("function_calls_locations-final.json") as f:
    raw_calls = json.load(f)

normalized = []

for call in raw_calls:
    cleaned_path = clean_path(call.get("path", ""))
    method = normalize_method(call.get("method", "GET"))
    file = call.get("file", "unknown")

    normalized.append({
        "path": cleaned_path,
        "method": method,
        "file": file
    })

with open("function_calls_locations-norm.json", "w") as out:
    json.dump(normalized, out, indent=2)

print(
    f"✅ Normalized {len(normalized)} frontend routes to 'function_calls_locations-norm.json'")
