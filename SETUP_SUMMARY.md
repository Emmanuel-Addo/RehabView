# RehabView Ghana - Setup Summary

## What Has Been Done

I've successfully adapted the EcoPulse codebase for mine rehabilitation monitoring. Here's what was changed:

### 1. Project Renaming
- ✅ README.md updated with new project name and description
- ✅ Page metadata updated (title, description)
- ✅ Layout metadata updated
- ✅ All components renamed from "EcoPulse" to "RehabView"

### 2. UI/UX Updates
- ✅ Dashboard branding updated
- ✅ About modal updated with new project info
- ✅ Disclaimer modal updated
- ✅ Tour guide updated
- ✅ Layer info changed from carbon/mining to NDVI/rehabilitation
- ✅ KPI labels updated (NDVI, Recovery Rate, Hectares Restored)

### 3. Technical Changes
- ✅ All components converted to .jsx files
- ✅ API routes updated for rehabilitation data
- ✅ GEE configuration updated with new environment variables
- ✅ Map layers updated for NDVI and rehabilitation status
- ✅ Metrics calculations updated for vegetation recovery

### 4. New Files Created
- ✅ `.env.example` - Environment variables template
- ✅ `scripts/ndvi_calculation.js` - GEE script for NDVI calculation
- ✅ `scripts/rehabilitation_status.js` - GEE script for rehabilitation classification

---

## What You Need to Add

### 1. Google Earth Engine Setup

**Required:**
- GEE account (free for research: https://earthengine.google.com/)
- Service account credentials (PRIVATE_KEY, SERVICE_EMAIL, PROJECT_ID)

**How to get:**
1. Go to Google Cloud Console
2. Create a new project or use existing
3. Enable Earth Engine API
4. Create a service account
5. Download the private key JSON file

### 2. CERSGIS Mining Footprints

**Required:**
- Mining footprints FeatureCollection

**How to get:**
1. Visit: https://servir.icrisat.org/artisanal-mining-galamsey-monitoring/
2. Request access to mining footprints data
3. Download the FeatureCollection
4. Upload to your GEE assets

### 3. Create GEE Assets

Run the provided scripts in Google Earth Engine Code Editor:

**Step 1: Create NDVI FeatureCollection**
1. Open `scripts/ndvi_calculation.js` in GEE Code Editor
2. Update the asset paths to match your project
3. Run the script
4. Export the results to your GEE assets

**Step 2: Create Rehabilitation FeatureCollection**
1. Open `scripts/rehabilitation_status.js` in GEE Code Editor
2. Update the asset paths to match your project
3. Run the script
4. Export the results to your GEE assets

### 4. Environment Variables

Create `.env.local` file with these values:

```env
# Google Earth Engine Service Account Credentials
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
SERVICE_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
PROJECT_ID="your-google-cloud-project-id"

# GEE FeatureCollections
NDVI_FC="projects/your-project/assets/ndvi-feature-collection"
REHABILITATION_FC="projects/your-project/assets/rehabilitation-feature-collection"
MINING_FOOTPRINTS_FC="projects/your-project/assets/mining-footprints-feature-collection"
PILOT_AREA="projects/your-project/assets/pilot-area-boundary"

# GEE ImageCollections
NDVI_VIS="projects/your-project/assets/ndvi-image-collection"
REHABILITATION_VIS="projects/your-project/assets/rehabilitation-image-collection"
```

---

## Quick Start (After Setup)

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Create `.env.local` with your credentials

3. Run development server:
   ```bash
   yarn dev
   ```

4. Open http://localhost:3000

---

## File Structure

```
RehabView-ghana/
├── app/
│   ├── api/
│   │   └── gee/
│   │       ├── districts/route.js
│   │       ├── layers/route.js
│   │       ├── metadata/route.js
│   │       └── metrics/route.js
│   ├── components/
│   │   ├── AboutModal.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DisclaimerModal.jsx
│   │   ├── Map.jsx
│   │   └── ... (other components)
│   ├── page.js
│   └── layout.js
├── lib/
│   └── gee-server.js
├── scripts/
│   ├── ndvi_calculation.js
│   └── rehabilitation_status.js
├── .env.example
├── README.md
└── package.json
```

---

## Next Steps

1. **Set up GEE credentials** - Follow the instructions above
2. **Request CERSGIS data** - Contact CERSGIS for mining footprints
3. **Run GEE scripts** - Create the required assets
4. **Configure environment** - Fill in `.env.local`
5. **Test the application** - Run `yarn dev`
6. **Deploy** - Deploy to Vercel or similar platform

---

## Support

For questions about:
- GEE setup: https://developers.google.com/earth-engine
- CERSGIS data: https://servir.icrisat.org/artisanal-mining-galamsey-monitoring/
- Project issues: Create an issue on GitHub

---

**Status:** ✅ Code ready, awaiting GEE credentials and CERSGIS data access

