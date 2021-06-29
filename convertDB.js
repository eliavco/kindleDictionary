var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./resources/original.db', sqlite3.OPEN_READONLY);
var Languages;
(function (Languages) {
    Languages[Languages["Hebrew"] = 0] = "Hebrew";
    Languages[Languages["English"] = 1] = "English";
})(Languages || (Languages = {}));
var languages = Object.keys(Languages);
///// CLASSES
var Word = /** @class */ (function () {
    function Word(id, name, langId, transcription) {
        this.id = id;
        this.name = name;
        this.langId = langId;
        this.transcription = transcription;
    }
    Word.addWord = function (w) { this.words.push(w); };
    Word.words = [];
    return Word;
}());
var Translation = /** @class */ (function () {
    function Translation(id, idWord, idTranslation, idCategory) {
        this.id = id;
        this.idWord = idWord;
        this.idTranslation = idTranslation;
        this.idCategory = idCategory;
        console.log(languages[2]);
    }
    Translation.addTranslation = function (t) { this.translations.push(t); };
    Translation.translations = [];
    return Translation;
}());
var Category = /** @class */ (function () {
    function Category(id, name) {
        this.id = id;
        this.name = name;
    }
    Category.addCategory = function (c) { this.categories.push(c); };
    Category.categories = [];
    return Category;
}());
var Definition = /** @class */ (function () {
    function Definition() {
    }
    Definition.addDefinition = function (d) { this.definitions.push(d); };
    Definition.definitions = [];
    return Definition;
}());
/// END CLASSES
function extractData() {
    // words
    db.each('SELECT * FROM word', function (err, row) {
        var w = new Word(row.id, row.name, row.langId, row.transcription);
        Word.addWord(w);
    });
    // translations
    db.each("SELECT * FROM translation", function (err, row) {
        var t = new Translation(row.id, row.idWord, row.idTranslation, row.idCategory);
        Translation.addTranslation(t);
    });
    // categories
    db.each("SELECT * FROM category", function (err, row) {
        var c = new Category(row.id, row.name);
        Category.addCategory(c);
        // process
        processData();
    });
}
db.serialize(extractData);
db.close();
function processData() {
    console.log(Word.words.slice(0, 100));
    console.log(Translation.translations.slice(0, 100));
    console.log(Category.categories);
}
