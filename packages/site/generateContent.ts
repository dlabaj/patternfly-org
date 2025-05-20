import { promises as fs } from 'fs';
import path from 'path';

const SOURCE_DIR = path.resolve(__dirname, '../documentation-site/patternfly-docs/content');
const DEST_DIR = path.resolve(__dirname, './src/generated/content');

async function copyDirectory(source: string, destination: string) {
  try {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    entries.forEach(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy subdirectories
        await copyDirectory(sourcePath, destPath);
      } else {
        // Copy files
        await fs.copyFile(sourcePath, destPath);
      }
    });
  } catch (error) {
    console.error(`Error copying directory ${source}:`, error);
    throw error;
  }
}

async function generateContent() {
  try {
    console.log('Starting content generation...');
    console.log(`Source directory: ${SOURCE_DIR}`);
    console.log(`Destination directory: ${DEST_DIR}`);

    try {
      await fs.access(SOURCE_DIR);
    } catch (error) {
      throw new Error(`Source directory does not exist: ${SOURCE_DIR}`);
    }

    console.log(`Copying content from ${SOURCE_DIR} to ${DEST_DIR}`);
    await copyDirectory(SOURCE_DIR, DEST_DIR);
    
    console.log('Content generation completed successfully!');
  } catch (error) {
    console.error('Content generation failed:', error);
    process.exit(1);
  }
}

generateContent();
