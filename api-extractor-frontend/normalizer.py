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

    if raw in ("_getjson", "_get", "apiget", "_getplaintext"):
        return "GET"
    if raw in ("_post", "post", "apipost", "fetch"):
        return "POST"
    return raw.upper()


# Load raw data
with open("api_calls-new.json") as f:
    raw_frontend = json.load(f)

normalized = []

# Normalize each route
for raw_path, entries in raw_frontend.items():
    cleaned_path = clean_path(raw_path)

    for entry in entries:
        method = normalize_method(entry.get("method", "GET"))
        normalized.append({
            "path": cleaned_path,
            "method": method,
            "file": entry.get("file", "unknown")
        })

# Write the result
with open("frontend_routes.json", "w") as out:
    json.dump(normalized, out, indent=2)

print(
    f"✅ Normalized {len(normalized)} frontend routes to 'frontend_routes.json'")
