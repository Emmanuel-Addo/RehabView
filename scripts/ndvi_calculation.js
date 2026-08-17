// RehabPulse Ghana - NDVI Calculation Script
// This script calculates NDVI from Sentinel-2 imagery for mine rehabilitation monitoring

// Define study area (Ghana's high forest zone)
var studyArea = ee.FeatureCollection('projects/your-project/assets/pilot-area-boundary');

// Define time range
var startYear = 2020;
var endYear = 2025;

// Function to mask clouds using the QA60 band
function maskS2Clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

// Function to calculate NDVI
function calculateNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
}

// Function to create annual NDVI composites
function getAnnualNDVI(year) {
  var startDate = year + '-01-01';
  var endDate = year + '-12-31';
  
  var composite = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(startDate, endDate)
    .filterBounds(studyArea)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .map(maskS2Clouds)
    .map(calculateNDVI)
    .select('NDVI')
    .median()
    .clip(studyArea);
  
  return composite.set('YEAR', year);
}

// Create annual NDVI composites for all years
var annualNDVI = ee.ImageCollection([]);
for (var year = startYear; year <= endYear; year++) {
  var yearlyNDVI = getAnnualNDVI(year);
  annualNDVI = annualNDVI.merge(ee.ImageCollection([yearlyNDVI]));
}

// Calculate NDVI statistics by region/district
var regions = ee.FeatureCollection('projects/your-project/assets/full-regions');

// Function to calculate zonal statistics
function calculateZonalStats(image, region FC) {
  return image.reduceRegions({
    collection: regionFC,
    reducer: ee.Reducer.mean().combine({
      reducer2: ee.Reducer.stdDev(),
      sharedInputs: true
    }),
    scale: 30
  });
}

// Calculate annual NDVI statistics by region
var annualStats = annualNDVI.map(function(image) {
  var year = image.get('YEAR');
  var stats = calculateZonalStats(image, regions);
  return stats.map(function(feature) {
    return feature.set('YEAR', year);
  });
});

// Flatten the collection
var allStats = annualStats.flatten();

// Export to Google Drive
Export.table.toDrive({
  collection: allStats,
  description: 'rehabpulse_ndvi_statistics',
  folder: 'RehabPulse_Ghana',
  fileFormat: 'CSV'
});

// Export as GEE FeatureCollection
Export.table.toAsset({
  collection: allStats,
  description: 'rehabpulse_ndvi_feature_collection',
  assetId: 'projects/your-project/assets/ndvi-feature-collection'
});

// Visualization parameters
var ndviVis = {
  min: 0,
  max: 1,
  palette: ['#8B4513', '#D2691E', '#9ACD32', '#228B22', '#006400']
};

// Add to map
Map.centerObject(studyArea, 9);
Map.addLayer(annualNDVI.filter(ee.Filter.eq('YEAR', 2024)).first(), ndviVis, 'NDVI 2024');

print('NDVI calculation complete. Check Tasks tab to run export.');
