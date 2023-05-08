const { readdir } = require('fs/promises');
const { pipeline } = require('stream/promises');
const { join } = require('path');
const { createReadStream, createWriteStream } = require('fs');
const pathLink = join(__dirname, 'styles');
const pathProjectDist = join(__dirname, 'project-dist', 'bundle.css');

async function createStyles() {
  try {
    const files = await readdir(pathLink, { withFileTypes: true });

    const cssFilesList = files.filter((file) => {
      if (file.isFile() && file.name.match(/.css/i)) {
        return true;
      }
      return false;
    });

    for (const file of cssFilesList) {
      const writeStream = createWriteStream(pathProjectDist, { flags: 'a' });
      const readStream = createReadStream(join(pathLink, file.name));
      await pipeline(readStream, writeStream);
    }
    console.log('Your styles is ready!');
  } catch (error) {
    console.error(error.message);
  }
}

createStyles();