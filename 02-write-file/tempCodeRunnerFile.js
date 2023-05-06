const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;
const fileInfo = path.join(__dirname, 'info.txt');

fs.writeFile(fileInfo, '', (error) => {
  if (error) {
    console.log(error.message);
  }
});

console.log('Hello! What is the year now?');

stdin.on('data', (data) => {
  if (data.toString().replace(/\r?\n|\r/g, '') === 'exit') {
    finishProgramm();
  }

  process.on('SIGINT', function () {
    finishProgramm();
  });

  fs.appendFile(fileInfo, data.toString(), (error) => {
    if (error) {
      console.log(error.message);
    }
  });
});

const finishProgramm = () => {
  stdout.write('Cheer!');
  process.exit();
};