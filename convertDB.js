var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./resources/original.db', sqlite3.OPEN_READONLY);

db.serialize(function () {
  db.each('SELECT * FROM word', function (err, row) {
    console.log(row);
  });
});

db.close();
