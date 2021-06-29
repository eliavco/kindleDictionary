const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('resources/db.json'));
console.log(dictionary.length);