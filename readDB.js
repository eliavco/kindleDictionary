var fs = require('fs');
var dictionary = JSON.parse(fs.readFileSync('resources/db.json'));
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function query() {
    rl.question('What are you looking for?', function (name) {
        console.log(dictionary.filter(function (dic) { return dic.lookup === name; })[0]);
        query();
    });
}
query();
