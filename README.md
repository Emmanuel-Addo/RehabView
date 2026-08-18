# RehabView Ghana

A web geoportal for monitoring vegetation health (NDVI) across regions and districts in Ghana, powered by Sentinel-2 satellite imagery via Google Earth Engine.

## What is This?

RehabView Ghana is an interactive geospatial platform that lets anyone — a researcher, a district officer, or a policymaker — select their **region or district** and instantly view its **NDVI (Normalized Difference Vegetation Index)** trend over time.

Rather than generic satellite imagery, the platform presents annual NDVI summaries aggregated by administrative boundary (region → district), making it easy to compare vegetation health across areas and track changes year by year.

## What the Platform Shows

- **NDVI by Region / District** — select any administrative unit to see its vegetation health score
- **Annual NDVI trends** — 2020 to 2025, sourced from Sentinel-2
- **Vegetation health classification** — Low / Moderate / High vegetation cover
- **Interactive map layers** — toggle NDVI layers on/off, compare years
- **District-level statistics** — mean NDVI, area coverage, year-on-year change

The interface runs in a browser. No installation is required.

## Approach

Vegetation health is measured using NDVI calculated from Sentinel-2 SR Harmonized imagery via Google Earth Engine. NDVI values range from -1 to 1, where higher values indicate denser, healthier vegetation.

Data is aggregated using Ghana's official administrative boundaries (regions and districts) from the Ghana Statistical Service, allowing users to query results by location rather than by manually drawing areas.

## Data Sources

| Dataset | Source | Role |
|---|---|---|
| Sentinel-2 SR Harmonized | European Space Agency | Satellite imagery for NDVI calculation |
| Ghana District Boundaries | Ghana Statistical Service | Administrative filtering by region/district |
| Dynamic World V1 | Google and World Resources Institute | Land cover reference |
| Copernicus DEM (GLO-30) | European Space Agency | Terrain context |

## Coverage

- **Temporal:** 2020 to 2025 (annual composites)
- **Geographic:** All regions and districts across Ghana

## Who It's For

- District and regional environmental officers
- Forestry Commission staff
- Environmental Protection Agency (EPA)
- Researchers studying land cover and vegetation change
- NGOs and development partners working on land restoration

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Google Earth Engine account with service account credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/RehabView-ghana.git
   cd RehabView-ghana
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create `.env.local` file from the example:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your credentials in `.env.local` (see Environment Variables below)

5. Run the development server:
   ```bash
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `PRIVATE_KEY` | GEE service account private key | Google Cloud Console |
| `SERVICE_EMAIL` | GEE service account email | Google Cloud Console |
| `PROJECT_ID` | Google Cloud project ID | Google Cloud Console |
| `NDVI_FC` | NDVI FeatureCollection asset path | Create in GEE |
| `NDVI_VIS` | NDVI ImageCollection for map tiles | Create in GEE |
| `PILOT_AREA` | Study area boundary | Create in GEE |

### Creating GEE Assets

1. **NDVI FeatureCollection** — Region/district polygons with annual NDVI statistics
2. **NDVI ImageCollection** — Annual NDVI mosaics for map tile rendering

See the GEE scripts in `/scripts` folder for implementation details.

## Citation

A peer-reviewed publication is in preparation. Citation details will be added here once available.

## Contact

For questions or data access requests, please open an issue on GitHub.

---

Last updated: August 2026
