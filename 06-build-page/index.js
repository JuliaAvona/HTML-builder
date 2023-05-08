const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { readdir, readFile, mkdir, rm, writeFile } = require('fs/promises');
const { Transform } = require('stream');
const readline = require('readline');
const { pipeline } = require('stream/promises');

/** Create folder
 *
 * @param {*} nameFolder
 * @returns boolean
 */

async function folderCreating(nameFolder) {
  try {
    await mkdir(nameFolder, { recursive: true });
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

/** Create 'index.html'
 *
 * @param {*} componentsPath
 * @returns
 */
async function componentsRead(componentsPath) {
  try {
    const files = await readdir(componentsPath, { withFileTypes: true });
    const listlFilesHTML = files.filter(
      (file) => file.isFile() && file.name.match(/.html/i)
    );
    return listlFilesHTML;
  } catch (error) {
    console.error(error.message);
  }
}

async function templateRead() {
  try {
    const data = await readFile(path.join(__dirname, 'template.html'));
    const templateHTML = data.toString();
    return templateHTML;
  } catch (error) {
    console.error(error.message);
  }
}

async function indexCreateHTML() {
  try {
    const listlFilesHTML = await componentsRead(
      path.join(__dirname, 'components')
    );
    const templateHTML = await templateRead();
    const indexHtml = await readFilesHTML(listlFilesHTML, templateHTML);

    await new Promise((resolve, reject) => {
      const streamWrite = createWriteStream(
        path.join(__dirname, 'project-dist', 'index.html')
      );

      streamWrite.write(indexHtml, () => {
        streamWrite.end();
      });

      streamWrite.on('finish', () => {
        console.log('index.html is ready!');
        resolve();
      });

      streamWrite.on('error', reject);
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function readFilesHTML(listlFilesHTML, templateHTML) {
  try {
    if (listlFilesHTML.length === 0) {
      return templateHTML;
    }

    const file = listlFilesHTML[0].name;
    const nameFile = path.basename(`${file}`, path.extname(`${file}`));

    const regExp = new RegExp(`(\\s*){{${nameFile}}}`);
    const result = await new Promise((resolve, reject) => {
      const readStream = createReadStream(
        path.join(__dirname, 'components', file)
      );
      const rl = readline.createInterface(readStream);

      const spaces = templateHTML.match(regExp)
        ? templateHTML.match(regExp)[1]
        : '';
      let data = '';
      rl.on('line', (chunk) => (data += spaces + chunk));

      rl.on('close', () => {
        templateHTML = templateHTML.replace(regExp, data);
        resolve(templateHTML);
      });

      rl.on('error', reject);
    });

    templateHTML = readFilesHTML(listlFilesHTML.slice(1), result);
    return templateHTML;
  } catch (error) {
    console.error(error.message);
  }
}

/** Create 'style.css'
 *
 */
async function createStyleCss() {
  try {
    const pathSrc = path.join(__dirname, 'styles');
    const pathDist = path.join(__dirname, 'project-dist', 'style.css');
    const files = await readdir(pathSrc, { withFileTypes: true });

    const listCSSFiles = files.filter((file) => {
      if (file.isFile() && file.name.match(/.css/i)) {
        return true;
      }
      return false;
    });

    const promisesReading = listCSSFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const readStream = createReadStream(path.join(pathSrc, `${file.name}`));
        const style = [];

        readStream.on('data', (data) => style.push(data));
        readStream.on('end', () => {
          resolve(...style);
        });
        readStream.on('error', reject);
      });
    });

    const styles = await Promise.all(promisesReading);

    await writeFile(pathDist, styles.join('\n'));

    console.log('Style.css is ready!');
  } catch (error) {
    console.error(error.message);
  }
}

async function folderCopy(pathDist, pathSrc) {
  try {
    await folderCreating(pathDist);

    const files = await readdir(pathSrc, { withFileTypes: true });

    files.forEach((file) => {
      if (file.isFile()) {
        const readStream = createReadStream(path.join(pathSrc, `${file.name}`));
        const streamWrite = createWriteStream(
          path.join(pathDist, `${file.name}`)
        );

        readStream.pipe(streamWrite);

        readStream.on('error', (error) => console.error(error.message));
        streamWrite.on('error', (error) => console.error(error.message));
      } else {
        folderCopy(
          path.join(pathDist, `${file.name}`),
          path.join(pathSrc, `${file.name}`)
        );
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}

/** Create 'assets'
 *
 * @returns
 */
async function createAssets() {
  try {
    const pathDist = path.join(__dirname, 'project-dist', 'assets');
    const pathSrc = path.join(__dirname, 'assets');

    await rm(pathDist, { recursive: true, force: true });
    await folderCopy(pathDist, pathSrc);

    return console.log('Folder "assets" is ready');
  } catch (error) {
    console.error(error.message);
  }
}

folderCreating(path.join(__dirname, 'project-dist'))
  .then((isCreate) => {
    if (isCreate) {
      indexCreateHTML();
      createStyleCss();
      createAssets();
    }
  })
  .catch((error) => console.error(error.message));