// analyze_api_usage.js

const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const sourceDir = "../src"; // or wherever your frontend code is

const apiCalls = {};

function recordCall(endpoint, method, file, functionName = null) {
    if (!apiCalls[endpoint]) {
        apiCalls[endpoint] = [];
    }

    // Check for duplicates
    const isDuplicate = apiCalls[endpoint].some(
        (call) =>
            call.method === method &&
            call.file === file
            );

    if (!isDuplicate) {
        apiCalls[endpoint].push({ method, file, function: functionName });
    }
}
  

function resolveConcatenation(node) {
    if (node.type !== "BinaryExpression" || node.operator !== "+") return null;

    const flatten = (n) => {
        if (n.type === "StringLiteral") return n.value;
        if (n.type === "TemplateLiteral") return n.quasis.map(q => q.value.cooked).join("${...}");
        if (n.type === "BinaryExpression") return resolveConcatenation(n);
        if (n.type === "MemberExpression") return "BASE_URL"; // optional: better resolution
        if (n.type === "Identifier") return "${...}";
        return null;
    };

    const left = flatten(node.left);
    const right = flatten(node.right);

    return left && right ? left + right : null;
}

function resolveEndpoint(argNode, variableMap) {
    if (!argNode) return null;

    if (argNode.type === "StringLiteral") {
        return argNode.value;
    }

    if (argNode.type === "TemplateLiteral") {
        return argNode.quasis.map((q) => q.value.cooked).join("${...}");
    }

    if (argNode.type === "BinaryExpression") {
        return resolveConcatenation(argNode);
    }

    if (argNode.type === "Identifier") {
        const resolved = variableMap.get(argNode.name);
        return resolveEndpoint(resolved, variableMap);
    }

    return null;
}

function analyzeFile(filePath) {
    const code = fs.readFileSync(filePath, "utf-8");
    const ast = babelParser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "classProperties"],
    });

    const variableMap = new Map();

    traverse(ast, {
        VariableDeclarator({ node }) {
            const { id, init } = node;
            if (id.type === "Identifier" && init) {
                if (
                    init.type === "BinaryExpression" &&
                    (init.operator === "+" || init.operator === "+=")
                ) {
                    let value = resolveConcatenation(init);
                    if (value) variableMap.set(id.name, { type: "StringLiteral", value });
                } else {
                    variableMap.set(id.name, init);
                }
            }
        },
        FunctionDeclaration(path) {
            if (path.node.id) {
                currentFunctionName = path.node.id.name;
            }
        },

        ClassMethod(path) {
            if (path.node.key && path.node.key.name) {
                currentFunctionName = path.node.key.name;
            }
        },

        AssignmentExpression(path) {
            const node = path.node;
            currentFunctionName = null; // Reset before entering a new method
            // Check for prototype assignments
            if (
                node.left.type === "MemberExpression" &&
                node.left.object.type === "MemberExpression" &&
                node.left.object.object.name === "Zeeguu_API" &&
                node.left.object.property.name === "prototype"
            ) {
                const methodName = node.left.property.name;
                currentFunctionName = methodName;
                
                if (
                    node.right.type === "FunctionExpression" ||
                    node.right.type === "ArrowFunctionExpression"
                ) {
                    const functionBodyPath = path.get("right");

                    functionBodyPath.traverse({
                        CallExpression(callPath) {
                            const callee = callPath.node.callee;
                            const endpointArg = callPath.node.arguments[0];
                            const endpoint = resolveEndpoint(endpointArg, variableMap); // Resolve dynamic endpoint

                            if (!endpoint) return;

                            if (
                                callee.type === "MemberExpression" &&
                                callee.object.type === "ThisExpression" &&
                                ["_getJSON", "_getPlainText", "_post", "apiGet", "apiPost"].includes(
                                    callee.property.name
                                )
                            ) {
                                recordCall(endpoint, callee.property.name.toUpperCase(), filePath, currentFunctionName);
                            }
                        },
                    });
                }
            }
        },
        CallExpression(path) {
            const node = path.node;
            const callee = node.callee;

            const enclosingFunction = path.getFunctionParent();
            let functionName = null;

            if (enclosingFunction) {
                const fnNode = enclosingFunction.node;

                // Case: named function
                if (fnNode.id && fnNode.id.name) {
                    functionName = fnNode.id.name;
                }

                // Case: class method
                if (fnNode.key && fnNode.key.name) {
                    functionName = fnNode.key.name;
                }
            }

            // Match this._getJSON("endpoint")
            if (
                callee.type === "MemberExpression" &&
                callee.object.type === "ThisExpression" &&
                ["_getJSON", "_getPlainText", "_post", "apiGet", "apiPost"].includes(
                    callee.property.name
                )
            ) {
                const endpoint = resolveEndpoint(node.arguments[0], variableMap);
                if (endpoint) {
                    recordCall(endpoint, callee.property.name.toUpperCase(), filePath, functionName);
                }
            }

            // Match fetch("endpoint") or fetch(url)
            if (callee.type === "Identifier" && callee.name === "fetch") {
                const arg = node.arguments[0];
                const endpoint = resolveEndpoint(arg, variableMap);
                if (endpoint) {
                    recordCall(endpoint, "FETCH", filePath, functionName);
                }
            }

            // Match axios({...})
            if (callee.type === "Identifier" && callee.name === "axios") {
                const config = node.arguments[0];
                if (config && config.type === "ObjectExpression") {
                    const urlProp = config.properties.find((p) => p.key.name === "url");
                    const methodProp = config.properties.find(
                        (p) => p.key.name === "method"
                    );

                    if (urlProp && urlProp.value) {
                        const endpoint = resolveEndpoint(urlProp.value, variableMap);
                        const method =
                            methodProp && methodProp.value.type === "StringLiteral"
                                ? methodProp.value.value.toUpperCase()
                                : "AXIOS";
                        if (endpoint) {
                            recordCall(endpoint, method, filePath, functionName);
                        }
                    }
                }
            }
        },
    });
}

function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
            analyzeFile(fullPath);
        }
    });
}

walk(sourceDir);

fs.writeFileSync("api_calls-updated.json", JSON.stringify(apiCalls, null, 2));
console.log("✅ API call extraction complete. See api_calls.json.");


// ✅ Write to file
//const outputFile = "api_endpoints.json";
//fs.writeFileSync(outputFile, JSON.stringify(endpointsMap, null, 2));
//console.log(== Extracted API Dependencies written to '${outputFile}' ==);
