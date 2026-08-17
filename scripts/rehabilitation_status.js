// RehabPulse Ghana - Rehabilitation Status Calculation Script
// This script classifies mine rehabilitation status based on NDVI changes

// Define study area
var studyArea = ee.FeatureCollection('projects/your-project/assets/pilot-area-boundary');
var miningFootprints = ee.FeatureCollection('projects/your-project/assets/mining-footprints-feature-collection');

// Define time range
var startYear = 2020;
var endYear = 2025;

// Function to mask clouds
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

// Create annual NDVI composites
var annualNDVI = ee.ImageCollection([]);
for (var year = startYear; year <= endYear; year++) {
  var yearlyNDVI = getAnnualNDVI(year);
  annualNDVI = annualNDVI.merge(ee.ImageCollection([yearlyNDVI]));
}

// Function to classify rehabilitation status
function classifyRehabilitation(ndviImage, year) {
  // Get NDVI values
  var ndvi = ndviImage.select('NDVI');
  
  // Classification thresholds
  var noRecovery = ndvi.lt(0.2);  // Bare soil
  var partialRecovery = ndvi.gte(0.2).and(ndvi.lt(0.4));  // Sparse vegetation
  var fullRecovery = ndvi.gte(0.4);  // Healthy vegetation
  
  // Create classified image
  var classified = ee.Image(0)
    .where(noRecovery, 1)  // No recovery
    .where(partialRecovery, 2)  // Partial recovery
    .where(fullRecovery, 3)  // Full recovery
    .rename('REHAB_STATUS')
    .clip(studyArea);
  
  return classified.set('YEAR', year);
}

// Classify rehabilitation for each year
var annualRehab = ee.ImageCollection([]);
for (var year = startYear; year <= endYear; year++) {
  var ndviImage = annualNDVI.filter(ee.Filter.eq('YEAR', year)).first();
  var rehabImage = classifyRehabilitation(ndviImage, year);
  annualRehab = annualRehab.merge(ee.ImageCollection([rehabImage]));
}

// Calculate rehabilitation statistics by mining site
function calculateRehabStats(rehabImage, miningFC) {
  // Count pixels in each category
  var stats = rehabImage.reduceRegions({
    collection: miningFC,
    reducer: ee.Reducer.sum().combine({
      reducer2: ee.Reducer.count(),
      sharedInputs: true
    }),
    scale: 30
  });
  
  return stats;
}

// Calculate annual rehabilitation statistics
var annualRehabStats = annualRehab.map(function(image) {
  var year = image.get('YEAR');
  var stats = calculateRehabStats(image, miningFootprints);
  return stats.map(function(feature) {
    return feature.set('YEAR', year);
  });
});

// Flatten the collection
var allRehabStats = annualRehabStats.flatten();

// Calculate hectares restored (pixels with partial or full recovery)
var rehabWithHectares = allRehabStats.map(function(feature) {
  var totalPixels = ee.Number(feature.get('count'));
  var recoveredPixels = ee.Number(feature.get('sum'));
  var hectaresRestored = recoveredPixels.multiply(900).divide(10000); // 30m x 30m = 900 sq m = 0.09 hectares
  return feature.set('HECTARES', hectaresRestored);
});

// Export to Google Drive
Export.table.toDrive({
  collection: rehabWithHectares,
  description: 'rehabpulse_rehabilitation_statistics',
  folder: 'RehabPulse_Ghana',
  fileFormat: 'CSV'
});

// Export as GEE FeatureCollection
Export.table.toAsset({
  collection: rehabWithHectares,
  description: 'rehabpulse_rehabilitation_feature_collection',
  assetId: 'projects/your-project/assets/rehabilitation-feature-collection'
});

// Visualization parameters
var rehabVis = {
  min: 1,
  max: 3,
  palette: ['#dc2626', '#f97316', '#22c55e']  // Red, Orange, Green
};

// Add to map
Map.centerObject(studyArea, 9);
Map.addLayer(annualRehab.filter(ee.Filter.eq('YEAR', 2024)).first(), rehabVis, 'Rehabilitation Status 2024');

print('Rehabilitation status calculation complete. Check Tasks tab to run export.');
