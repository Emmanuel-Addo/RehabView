# RehabPulse Ghana

A web platform for monitoring vegetation recovery on artisanal mining sites in Ghana's high forest zone, 2020–2025.

## Background

Ghana's high forest zone is one of the most productive tropical forest landscapes in the world. It is also the centre of artisanal and small-scale gold mining, locally known as galamsey. Mining clears vegetation and topsoil to reach alluvial deposits, leaving abandoned pits that do not regenerate naturally.

Monitoring rehabilitation progress on these abandoned mining sites has been challenging. What has been missing is a clear picture of vegetation recovery at a resolution useful to the agencies responsible for forest protection and mining regulation. RehabPulse Ghana addresses that gap.

## What the platform shows

- Annual NDVI (vegetation health) across mining sites, 2020–2025
- Rehabilitation status classification (No Recovery / Partial / Full)
- Hectares under active rehabilitation
- Recovery rate and vegetation trends
- Toggleable map layers for NDVI and rehabilitation status
- A trend view comparing vegetation recovery over the full period

The interface runs in a browser. No installation is required.

## Approach

Vegetation health is measured using the Normalized Difference Vegetation Index (NDVI) calculated from Sentinel-2 satellite imagery via Google Earth Engine. NDVI values range from -1 to 1, where higher values indicate healthier vegetation.

Mining footprints come from the operational artisanal and small-scale mining monitoring service maintained by the Centre for Remote Sensing and Geographic Information Services (CERSGIS) at the University of Ghana. Rehabilitation status is determined by comparing NDVI values on mining sites over time, identifying areas where vegetation is recovering.

## Data sources

| Dataset | Source | Role |
|---|---|---|
| Sentinel-2 SR Harmonized | European Space Agency | Satellite imagery for NDVI calculation |
| Mining footprints | CERSGIS, U-Net on Planet NICFI imagery | Mining site boundaries |
| Dynamic World V1 | Google and World Resources Institute | Land cover classification |
| Copernicus DEM (GLO-30) | European Space Agency | Terrain analysis |
| Ghana District Boundaries | Ghana Statistical Service | Administrative filtering |

## Coverage

- Temporal: 2020 to 2025
- Geographic: selected districts in Ghana's high forest zone, spanning the Western, Western North, Ashanti, Ahafo, Bono, Eastern, and Central Regions

## Audience

The platform is built for the Forestry Commission, the Minerals Commission, the Environmental Protection Agency, environmental NGOs working on mine rehabilitation, and researchers studying land restoration in West Africa.

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Google Earth Engine account with service account credentials
- CERSGIS mining footprints access (request at https://servir.icrisat.org/artisanal-mining-galamsey-monitoring/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rehabpulse-ghana.git
   cd rehabpulse-ghana
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

You need to create a `.env.local` file with the following variables:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `PRIVATE_KEY` | GEE service account private key | Google Cloud Console |
| `SERVICE_EMAIL` | GEE service account email | Google Cloud Console |
| `PROJECT_ID` | Google Cloud project ID | Google Cloud Console |
| `NDVI_FC` | NDVI FeatureCollection asset path | Create in GEE |
| `REHABILITATION_FC` | Rehabilitation status FeatureCollection | Create in GEE |
| `MINING_FOOTPRINTS_FC` | Mining footprints from CERSGIS | Request from CERSGIS |
| `PILOT_AREA` | Study area boundary | Create in GEE |
| `NDVI_VIS` | NDVI ImageCollection for tiles | Create in GEE |
| `REHABILITATION_VIS` | Rehabilitation ImageCollection | Create in GEE |

### Creating GEE Assets

You need to create the following assets in Google Earth Engine:

1. **NDVI FeatureCollection** - Region/district polygons with annual NDVI values
2. **Rehabilitation FeatureCollection** - Region/district polygons with rehabilitation metrics
3. **Mining Footprints FeatureCollection** - Request from CERSGIS
4. **NDVI ImageCollection** - Annual NDVI mosaics for map tiles
5. **Rehabilitation ImageCollection** - Annual rehabilitation status mosaics

See the GEE scripts in `/scripts` folder for implementation details.

## Citation

A peer-reviewed publication is in preparation. Citation details will be added here once available.

## Contact

For questions or data access requests, please open an issue on GitHub.

---

Last updated: April 2026

