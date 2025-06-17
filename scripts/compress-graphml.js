const fs = require('fs');
const path = require('path');
const pako = require('pako');

// Define file paths
const inputFile = path.join(__dirname, '../public/interesting_candidates_v5.graphml');
const outputFile = path.join(__dirname, '../public/interesting_candidates_v5.graphml.gz');

// Read the GraphML file
console.log('Reading GraphML file...');
const xmlData = fs.readFileSync(inputFile, 'utf8');

// Log file size
const fileSize = fs.statSync(inputFile).size;
console.log('File size:', fileSize, 'bytes');

// Validate XML structure
console.log('\nValidating XML structure...');
if (!xmlData.includes('<graphml')) {
  console.error('Error: Input file is not a valid GraphML file (missing <graphml> tag)');
  process.exit(1);
}

if (!xmlData.includes('<graph')) {
  console.error('Error: Input file is not a valid GraphML file (missing <graph> tag)');
  process.exit(1);
}

// Log XML structure
console.log('XML Structure:');
console.log('Has graphml tag:', xmlData.includes('<graphml'));
console.log('Has graph tag:', xmlData.includes('<graph'));
console.log('Has nodes:', xmlData.includes('<node'));
console.log('Has edges:', xmlData.includes('<edge'));

// Count nodes and edges
const nodeCount = (xmlData.match(/<node/g) || []).length;
const edgeCount = (xmlData.match(/<edge/g) || []).length;
console.log('\nElement Counts:');
console.log('Nodes:', nodeCount);
console.log('Edges:', edgeCount);

// Ensure proper XML structure
let fixedXml = xmlData;

// Add XML declaration if missing
if (!fixedXml.trim().startsWith('<?xml')) {
  fixedXml = '<?xml version="1.0" encoding="UTF-8"?>\n' + fixedXml;
}

// Ensure proper GraphML structure
if (!fixedXml.includes('<graphml')) {
  fixedXml = fixedXml.replace(/<graph/, '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"><graph');
}

// Ensure proper closing tags
if (!fixedXml.includes('</graphml>')) {
  // Find the last complete edge tag
  const lastEdgeEnd = fixedXml.lastIndexOf('</edge>');
  if (lastEdgeEnd > 0) {
    // Truncate to the last complete edge
    fixedXml = fixedXml.substring(0, lastEdgeEnd + 7);
    // Add closing tags
    fixedXml += '\n</graph>\n</graphml>';
  } else {
    // If no complete edge found, try to find the last complete node
    const lastNodeEnd = fixedXml.lastIndexOf('</node>');
    if (lastNodeEnd > 0) {
      fixedXml = fixedXml.substring(0, lastNodeEnd + 7);
      fixedXml += '\n</graph>\n</graphml>';
    } else {
      console.error('Error: Could not find complete node or edge tags');
      process.exit(1);
    }
  }
}

// Validate the fixed XML structure
console.log('\nValidating fixed XML structure...');
console.log('Has XML declaration:', fixedXml.trim().startsWith('<?xml'));
console.log('Has graphml tag:', fixedXml.includes('<graphml'));
console.log('Has graph tag:', fixedXml.includes('<graph'));
console.log('Has nodes:', fixedXml.includes('<node'));
console.log('Has edges:', fixedXml.includes('<edge'));
console.log('Has closing graphml tag:', fixedXml.includes('</graphml>'));
console.log('Has closing graph tag:', fixedXml.includes('</graph>'));

// Log the first and last parts of the fixed XML
console.log('\nFirst 200 chars of fixed XML:', fixedXml.substring(0, 200));
console.log('Last 200 chars of fixed XML:', fixedXml.substring(fixedXml.length - 200));

// Compress the data
console.log('\nCompressing data...');
const compressed = pako.gzip(fixedXml, {
  level: 9, // maximum compression
  to: 'Uint8Array'
});

// Write the compressed data
console.log('Writing compressed file...');
fs.writeFileSync(outputFile, compressed);

// Verify the compressed file
console.log('Verifying compressed file...');
const compressedData = fs.readFileSync(outputFile);
const decompressed = pako.inflate(compressedData, { to: 'string' });

// Verify XML structure after decompression
console.log('\nVerifying decompressed XML structure...');
console.log('Has XML declaration:', decompressed.trim().startsWith('<?xml'));
console.log('Has graphml tag:', decompressed.includes('<graphml'));
console.log('Has graph tag:', decompressed.includes('<graph'));
console.log('Has nodes:', decompressed.includes('<node'));
console.log('Has edges:', decompressed.includes('<edge'));
console.log('Has closing graphml tag:', decompressed.includes('</graphml>'));
console.log('Has closing graph tag:', decompressed.includes('</graph>'));

// Verify node and edge counts after decompression
const decompressedNodeCount = (decompressed.match(/<node/g) || []).length;
const decompressedEdgeCount = (decompressed.match(/<edge/g) || []).length;
console.log('\nDecompressed Element Counts:');
console.log('Nodes:', decompressedNodeCount);
console.log('Edges:', decompressedEdgeCount);

// Log the first and last parts of the decompressed XML
console.log('\nFirst 200 chars of decompressed XML:', decompressed.substring(0, 200));
console.log('Last 200 chars of decompressed XML:', decompressed.substring(decompressed.length - 200));

// Log sizes
const originalSize = fs.statSync(inputFile).size;
const compressedSize = fs.statSync(outputFile).size;
const ratio = (compressedSize / originalSize * 100).toFixed(2);

console.log('\nCompression Results:');
console.log('Original size:', originalSize, 'bytes');
console.log('Compressed size:', compressedSize, 'bytes');
console.log('Compression ratio:', ratio + '%');

// Verify the file exists
if (fs.existsSync(outputFile)) {
  console.log('\nCompressed file created successfully at:', outputFile);
} else {
  console.error('\nError: Compressed file was not created!');
  process.exit(1);
} 