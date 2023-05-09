const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { mkdir, rm, readdir } = require('fs/promises');

async function creatingFold(folderPath) {
  try {
    await mkdir(folderPath, { recursive: true });
  } catch (error) {
    console.log(error.message);
  }
}

async function folderCopy(distPath, SRCpath) {
  try {
    await creatingFold(distPath);
    const files = await readdir(SRCpath, { withFileTypes: true });
    files.forEach((file) => {
      if (file.isFile()) {
        const streamRead = createReadStream(path.join(SRCpath, `${file.name}`));
        const streamWrite = createWriteStream(
          path.join(distPath, `${file.name}`)
        );

        streamRead.pipe(streamWrite);
        streamRead.on('error', (error) => console.error(error.message));
        streamWrite.on('error', (error) => console.error(error.message));
      } else {
        folderCopy(
          path.join(distPath, `${file.name}`),
          path.join(SRCpath, `${file.name}`)
        );
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}

(async () => {
  try {
    const distPath = path.join(__dirname, 'files-copy');
    const SRCpath = path.join(__dirname, 'files');

    await rm(distPath, { recursive: true, force: true });
    await folderCopy(distPath, SRCpath);
    return console.log('The folder is copied!');

  } catch (error) {
    console.error(error.message);
  }
})();