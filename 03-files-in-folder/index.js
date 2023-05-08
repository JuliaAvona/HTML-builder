const path = require('path');
const fs = require('fs');
const { stdin, stdout } = process;
const secretFolder = path.join(__dirname, 'secret-folder');

fs.readdir(secretFolder, { withFileTypes: true }, (error, files) => {
  if ( error ) {
    console.log( error.message );
  }

  for ( let file of files ) {
    if (!file.isFile()) {
      continue;
    }

    const pathAbsolute = path.join(__dirname, 'secret-folder', file.name);
    const nameFile = path.parse(pathAbsolute).name;
    const fileExtname = path.extname(pathAbsolute);

    fs.stat(pathAbsolute, (error, stats) => {
      if (error) {
        console.log(error.message);
      }

      const fileSize = stats.size / 1024 + 'kb';
      console.log(`${nameFile} - ${fileExtname} - ${fileSize}`);
    });
  }
});
