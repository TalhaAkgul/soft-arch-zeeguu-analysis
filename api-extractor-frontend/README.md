# api-extractor-backend

## Scripts


### `extractApiEndpoints.js`
- **Purpose:** Extracts wrapper functions.
- **Output:** Generates json file containing locations and names of the wrapper functions.

### `extract.js`
- **Purpose:** Takes output of `extractApiEndpoints.js` as input and finds locations where those wrapper functions are called.
- **Output:** Generates json file containing locations and names of the api calls.

### `extended-normalizer.py`
- **Purpose:** Normalizes data so that api-extractor-backend can compare.
- **Output:** Generates normalized json file.

## Usage

1. Run `extractApiEndpoints.js`.
2. Run `extract.js`.
3. Run `extended-normalizer.py`.
4. Copy the output to api-extractor-backend
