# api-extractor-backend

## Scripts


### `extract_api_endpoints.py`
- **Purpose:** Parses Flask route definitions.
- **Output:** Generates json file containing locations and names of the api endpoints defined.

### `compare.py`
- **Purpose:** Compares API endpoints defined in the backend with those used in the frontend.
- **Output:** Generates Mermaid diagram(s) to visualize which frontend modules call which backend endpoints.
- **Usage:** Customize the depth level to group modules hierarchically.

## Usage

1. Run `extract_api_endpoints.py`.
2. Put the json file frontend generated 
3. Run `compare.py` to generate visualizations and detect unused or missing API mappings.