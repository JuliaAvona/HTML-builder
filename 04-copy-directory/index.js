const path = require('path');
const fs = require('fs');

function copyDirectory() {
  const newPathDir = path.join(__dirname, 'files-copy');
  const filesPathDir = path.join(__dirname, 'files');

  fs.mkdir(newPathDir, (err) => {
    if (err && err.message.match(/already exists/)) {
      console.log('Updated successfully');
    } else if (err) {
      console.log(err.message);
    } else {
      console.log('Created successfully');
    }

    fs.readdir(filesPathDir, (err, files) => {
      if (err) {
        return console.log(err.message);
      }

      for (let file of files) {
        fs.copyFile(
          path.join(filesPathDir, file),
          path.join(newPathDir, file),
          (err) => {
            if (err) {
              return console.log(err.message);
            }
          }
        );
      }
      console.log('Files copy successfully');
    });
  });
}

copyDirectory();
