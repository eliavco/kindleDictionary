var fs = require('fs');
var dictionary = JSON.parse(fs.readFileSync('resources/db.json'));
console.log(dictionary.length);
