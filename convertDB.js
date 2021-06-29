var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./resources/original.db', sqlite3.OPEN_READONLY);
var _ = require('lodash');
var fs = require('fs');
var Languages;
(function (Languages) {
    Languages[Languages["Hebrew"] = 0] = "Hebrew";
    Languages[Languages["English"] = 1] = "English";
})(Languages || (Languages = {}));
var langs = Object.values(Languages);
var languages = langs.slice(0, Math.ceil(langs.length / 2));
///// CLASSES
var Word = /** @class */ (function () {
    function Word(id, name, langId, transcription) {
        this.id = id;
        this.name = name;
        this.langId = langId;
        this.transcription = transcription;
    }
    Word.getWord = function (id) { return this.words.filter(function (c) { return c.id === id; })[0] || new Word(0, '', 0, ''); };
    Word.addWord = function (w) { this.words.push(w); };
    Word.words = [];
    return Word;
}());
var Translation = /** @class */ (function () {
    function Translation(id, idWord, idTranslation, idCategory) {
        this.id = id;
        this.idWord = idWord;
        this.idTranslation = idTranslation;
        this.category = Category.getCategory(idCategory);
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
    Category.getCategory = function (id) { return this.categories.filter(function (c) { return c.id === id; })[0].name || ''; };
    Category.addCategory = function (c) { this.categories.push(c); };
    Category.categories = [];
    return Category;
}());
// class EnglishDefinition {
// 	static readonly records: EnglishDefinition[] = [];
// 	readonly word: string;
// 	readonly pronounciation: string;
// 	readonly definitions: { readonly translations: string[]; readonly partOfSpeech: string; }[] = [];
// 	constructor(word, pronounciation) {
// 		this.word = word;
// 		this.pronounciation = pronounciation;
// 	}
//   addDefinitionTrans(partOfSpeech: string, idTranslation: number): void {
//     const translation: string = Word.getWord(idTranslation).name;
// 		const a = this.definitions.filter(def => def.partOfSpeech === partOfSpeech);
// 		if (a.length > 0) {
// 			a[0].translations.push(translation);
// 		} else {
// 			a.push({ partOfSpeech, translations: [translation] });
// 		}
// 	}
// 	static isWordExist(id: number): boolean { return this.records.filter((r: EnglishDefinition) => r.word === Word.getWord(id).name).length > -1; }
// 	static getDefinition(idWord: number): EnglishDefinition { const word = Word.getWord(idWord).name; return this.records.filter(record => record.word === word)[0] || new EnglishDefinition('', ''); }
// 	static addDefinition(d: EnglishDefinition) { this.records.push(d); }
// }
/// END CLASSES
function extractData() {
    // categories
    db.each("SELECT * FROM category", function (err, row) {
        var c = new Category(row.id, row.name);
        Category.addCategory(c);
    });
    // words
    db.each('SELECT * FROM word', function (err, row) {
        var w = new Word(row.id, row.name, row.langId, row.transcription);
        Word.addWord(w);
    });
    // translations
    db.each("SELECT * FROM translation", function (err, row) {
        var t = new Translation(row.id, row.idWord, row.idTranslation, row.idCategory);
        Translation.addTranslation(t);
        // process
    }, function () {
        processData();
    });
}
db.serialize(extractData);
db.close();
function processData() {
    var newTranslations = _.groupBy(Translation.translations, (function (tr) { return tr.idWord; }));
    var inversedIndexWords = {};
    Word.words.forEach(function (word, ind) {
        inversedIndexWords[word.id] = ind;
    });
    function findWord(id) {
        return Word.words[inversedIndexWords["" + id]] || new Word(0, '', 0, '');
    }
    console.log(Object.keys(newTranslations).length);
    var filteredTranslations = [];
    Object.values(newTranslations).forEach(function (translation) {
        var origin = findWord(translation[0].idWord);
        if (origin.langId === Languages.English) {
            filteredTranslations.push(translation);
        }
    });
    var dictionary = [];
    filteredTranslations.forEach(function (translation) {
        var origin = findWord(translation[0].idWord);
        var lookup = origin.name;
        var pronounciation = origin.transcription;
        var definitions = {};
        translation.forEach(function (def) {
            var c = definitions[def.category];
            if (c) {
                c.push(findWord(def.idTranslation).name);
            }
            else {
                definitions[def.category] = [findWord(def.idTranslation).name];
            }
        });
        dictionary.push({ lookup: lookup, pronounciation: pronounciation, definitions: definitions });
    });
    fs.writeFileSync('resources/db.json', JSON.stringify(dictionary));
    // console.log(dictionary.filter(dic => dic.lookup === 'top')[0]);
}
