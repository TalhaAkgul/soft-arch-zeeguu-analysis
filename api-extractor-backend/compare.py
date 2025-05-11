import json
import os
import re

# Load frontend and backend route data
with open("frontend_routes.json", "r") as f:
    frontend_routes = json.load(f)
with open("backend_routes.json", "r") as f:
    backend_routes = json.load(f)


def normalize_path(path):
    path = (
        path.replace("<", "{")
        .replace(">", "}")
        .replace("${", "{")
        .replace("}", "}")
    )
    path = re.sub(r"\{[^\}]*\}", "", path)
    path = path.replace("//", "/")
    return path


def build_route_key(route):
    return f"{route['method'].upper()} {normalize_path(route['path'])}"


def split_path_hierarchy(path, depth):
    """Return list of path components from level 1 to `depth`"""
    parts = path.split(os.sep)
    paths = []
    for i in range(1, min(len(parts), depth) + 1):
        paths.append("/".join(parts[:i]))
    return paths


depth_level = 4

frontend_keys = set(build_route_key(r) for r in frontend_routes)
backend_keys = set(build_route_key(r) for r in backend_routes)

missing_in_backend = sorted(frontend_keys - backend_keys)
unused_in_frontend = sorted(backend_keys - frontend_keys)

print("\n🔍 API CALLS IN FRONTEND BUT MISSING BACKEND HANDLERS:")
for route in missing_in_backend:
    print("  ❌", route)

print("\n🧹 API ROUTES IN BACKEND BUT UNUSED IN FRONTEND:")
for route in unused_in_frontend:
    print("  ⚠️", route)

# Mermaid lines
mermaid_lines = ["graph TD"]
hierarchy_edges = set()

# Frontend call tracking
frontend_calls = {}
for route in frontend_routes:
    key = build_route_key(route)
    file_path = route.get("file", "frontend_unknown")
    path_levels = split_path_hierarchy(file_path, 4)
    for i in range(1, len(path_levels)):
        parent = path_levels[i - 1].replace("/", "_")
        child = path_levels[i].replace("/", "_")
        hierarchy_edges.add((parent, child))

    final_node = path_levels[-1].replace("/", "_")
    if key not in frontend_calls:
        frontend_calls[key] = []
    frontend_calls[key].append(final_node)

# Backend call tracking
backend_map = {}
for route in backend_routes:
    key = build_route_key(route)
    file_path = route.get("file", "backend_unknown")
    path_levels = split_path_hierarchy(file_path, 2)
    for i in range(1, len(path_levels)):
        parent = path_levels[i - 1].replace("/", "_")
        child = path_levels[i].replace("/", "_")
        hierarchy_edges.add((parent, child))

    backend_map[key] = path_levels[-1].replace("/", "_")

# Add hierarchy edges first
for parent, child in sorted(hierarchy_edges):
    mermaid_lines.append(f"  {parent} --> {child}")

# Add API call connections
for key in frontend_keys & backend_keys:
    frontend_nodes = frontend_calls.get(key, ["frontend_unknown"])
    backend_node = backend_map.get(key, "backend_unknown")
    label = key.replace(" ", "\\n")
    for frontend_node in frontend_nodes:
        mermaid_lines.append(
            f"  {frontend_node} -->|{label}| {backend_node}"
        )

# Write to file
with open("api_usage_mermaid.md", "w") as f:
    f.write("\n".join(mermaid_lines))

print("\n✅ Mermaid diagram written to api_usage_mermaid.md with hierarchy up to depth:", depth_level)
