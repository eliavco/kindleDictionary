const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('resources/db.json'));

const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function query() {
	rl.question('What are you looking for?', function (name) {
		console.log(dictionary.filter(dic => dic.lookup === name)[0]);
		query();
	});
}

query();
// 71747 words