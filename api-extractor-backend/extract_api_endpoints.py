import ast
import os
import re
import json
from typing import List, Dict


def extract_flask_routes_from_file(file_path: str) -> List[Dict[str, str]]:
    with open(file_path, "r", encoding="utf-8") as f:
        source = f.read()
        tree = ast.parse(source, filename=file_path)

    constants = {}

    class ConstantCollector(ast.NodeVisitor):
        def visit_Assign(self, node):
            if (
                isinstance(node.targets[0], ast.Name)
                and isinstance(node.value, ast.Str)
            ):
                constants[node.targets[0].id] = node.value.s

    ConstantCollector().visit(tree)

    routes = []

    class RouteVisitor(ast.NodeVisitor):
        def visit_FunctionDef(self, node):
            for decorator in node.decorator_list:
                if isinstance(decorator, ast.Call) and hasattr(decorator.func, 'attr'):
                    if decorator.func.attr == 'route':
                        route_path = None

                        if decorator.args:
                            arg = decorator.args[0]
                            if isinstance(arg, ast.JoinedStr):
                                parts = []
                                for value in arg.values:
                                    if isinstance(value, ast.Str):
                                        parts.append(value.s)
                                    elif isinstance(value, ast.FormattedValue):
                                        inner = value.value
                                        if isinstance(inner, ast.Name) and inner.id in constants:
                                            parts.append(constants[inner.id])
                                        else:
                                            parts.append(
                                                f"${{{ast.unparse(inner)}}}")
                                route_path = ''.join(parts)
                            elif isinstance(arg, ast.Str):
                                route_path = arg.s

                        methods = ['GET']  # default fallback
                        for kw in decorator.keywords:
                            if kw.arg == 'methods' and isinstance(kw.value, (ast.List, ast.Tuple)):
                                methods = [
                                    elt.s for elt in kw.value.elts if isinstance(elt, ast.Str)
                                ]

                        if route_path:
                            for method in methods:
                                routes.append({
                                    'path': route_path,
                                    'method': method,
                                    'file': file_path
                                })

    RouteVisitor().visit(tree)
    return routes


def extract_routes_from_directory(directory: str) -> List[Dict[str, str]]:
    all_routes = []
    print(f"Searching for Flask routes in directory: {directory}")
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                try:
                    routes = extract_flask_routes_from_file(file_path)
                    all_routes.extend(routes)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
    return all_routes


# Example usage
if __name__ == "__main__":
    backend_directory = "../zeeguu"
    routes = extract_routes_from_directory(backend_directory)
    with open("backend_routes.json", "w") as out:
        json.dump(routes, out, indent=2)
    for route in routes:
        print(f"{route['method']:6} {route['path']}  ({route['file']})")
