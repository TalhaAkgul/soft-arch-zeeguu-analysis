const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const apiCalls = require("./api_calls-updated-final.json"); // Load recorded API calls
const sourceDir = "../src"; // Path to your project files

// Helper function to check if a function is invoked in a file
function checkFunctionCalls(filePath, functionName) {
    const code = fs.readFileSync(filePath, "utf-8");
    const ast = babelParser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "classProperties"],
    });

    const filesWhereFunctionIsCalled = [];

    traverse(ast, {
        CallExpression(path) {
            const node = path.node;
            const callee = node.callee;

            if (
                callee.type === "MemberExpression" &&
                callee.property.name === functionName
            ) {
                // Match anything like this.updatePlaybackPosition(...) or api.updatePlaybackPosition(...)
                filesWhereFunctionIsCalled.push(filePath);
            }
        },
    });

    return filesWhereFunctionIsCalled;
}
  

// Function to walk through files and find where API functions are called
function findFunctionCalls() {
    const results = [];

    for (const endpoint in apiCalls) {
        apiCalls[endpoint].forEach((apiCall) => {
            const functionName = apiCall.function;
            const method = apiCall.method.replace(/^_/, "").toUpperCase(); // Convert _POST -> POST

            const foundFiles = [];

            // Walk through the source directory
            function searchDir(dirPath) {
                fs.readdirSync(dirPath).forEach((file) => {
                    const fullPath = path.join(dirPath, file);
                    const stat = fs.statSync(fullPath);

                    if (stat.isDirectory()) {
                        searchDir(fullPath);
                    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
                        const calls = checkFunctionCalls(fullPath, functionName);
                        foundFiles.push(...calls);
                    }
                });
            }

            searchDir(sourceDir);

            // Add matching calls to results
            for (const file of foundFiles) {
                results.push({
                    path: endpoint,
                    method: method,
                    file: file.replace(/\\/g, "\\") // Escape backslashes for JSON
                });
            }
        });
    }

    return results;
}
  
// Recursive function to check subdirectories
function findFunctionCallsInDir(dir, functionName, functionCallLocations) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findFunctionCallsInDir(fullPath, functionName, functionCallLocations);
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
            const foundCalls = checkFunctionCalls(fullPath, functionName);
            functionCallLocations[functionName].push(...foundCalls);
        }
    });
}

// Run the function and save the result to a file
const functionCallLocations = findFunctionCalls();
fs.writeFileSync("function_calls_locations-final.json", JSON.stringify(functionCallLocations, null, 2));
console.log("✅ Function call locations extraction complete. See function_calls_locations.json.");