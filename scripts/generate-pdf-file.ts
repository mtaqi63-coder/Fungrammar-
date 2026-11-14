import fs from 'fs';
import path from 'path';
import { generateGameDescriptionPdf } from '../src/utils/generateGamePdf';

try {
  const doc = generateGameDescriptionPdf();
  const pdfOutput = doc.output('arraybuffer');
  const buffer = Buffer.from(pdfOutput);

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'Fun-Grammar-Game-Description.pdf');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Successfully generated PDF at: ${outputPath} (${buffer.length} bytes)`);
} catch (err) {
  console.error('Error generating PDF:', err);
  process.exit(1);
}
