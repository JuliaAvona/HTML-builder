const path = require('node:path'); 
const fs = require('fs');
const text = path.resolve(__dirname + '/text.txt');
const { stdout } = process;

const readStream = fs.createReadStream(text);

readStream.on('data', (part) => {
    stdout.write(part.toString());
});