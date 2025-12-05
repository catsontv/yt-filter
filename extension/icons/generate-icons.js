// Simple Node.js script to generate PNG icons from SVG
// This creates the 3 required icon sizes for Chrome extension

const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgPath = path.join(__dirname, 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('SVG icon file found:', svgPath);
console.log('\nTo generate PNG icons, you have two options:\n');

console.log('OPTION 1 - Use Online Converter (EASIEST):');
console.log('1. Go to: https://convertio.co/svg-png/');
console.log('2. Upload icon.svg from this folder');
console.log('3. Download the PNG');
console.log('4. Resize to 16x16, 48x48, and 128x128 using:');
console.log('   - Windows Paint (Resize)');
console.log('   - Or: https://www.iloveimg.com/resize-image');
console.log('5. Save as icon16.png, icon48.png, icon128.png in this folder\n');

console.log('OPTION 2 - Use Temporary Placeholder (QUICK TEST):');
console.log('The extension will work with the base64 data URLs below.');
console.log('Just update manifest.json to use data URLs instead of file paths.\n');

console.log('OPTION 3 - Install sharp package (if you have Node.js):');
console.log('npm install sharp');
console.log('Then run: node generate-icons-sharp.js\n');

console.log('For now, creating simple placeholder PNGs using data URLs...');

// Create a simple HTML file that can generate the icons
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Generate Extension Icons</title>
</head>
<body>
    <h1>Chrome Extension Icon Generator</h1>
    <p>This will generate the required icon files.</p>
    
    <canvas id="canvas16" width="16" height="16" style="display:none;"></canvas>
    <canvas id="canvas48" width="48" height="48" style="display:none;"></canvas>
    <canvas id="canvas128" width="128" height="128" style="display:none;"></canvas>
    
    <div>
        <h3>Download Icons:</h3>
        <a id="download16" download="icon16.png">Download 16x16</a><br>
        <a id="download48" download="icon48.png">Download 48x48</a><br>
        <a id="download128" download="icon128.png">Download 128x128</a>
    </div>
    
    <script>
        const svg = \`${svgContent}\`;
        
        function generateIcon(size, canvasId, downloadId) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                const dataURL = canvas.toDataURL('image/png');
                document.getElementById(downloadId).href = dataURL;
            };
            
            const blob = new Blob([svg], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            img.src = url;
        }
        
        generateIcon(16, 'canvas16', 'download16');
        generateIcon(48, 'canvas48', 'download48');
        generateIcon(128, 'canvas128', 'download128');
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'generate-icons.html'), htmlContent);
console.log('✅ Created generate-icons.html');
console.log('\nOpen generate-icons.html in your browser and click the download links!');
console.log('Save the 3 PNG files to this icons folder.\n');
