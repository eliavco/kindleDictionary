var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./resources/original.db', sqlite3.OPEN_READONLY);

enum Languages {
	Hebrew, English
}
const languages = Object.values(Languages);

///// CLASSES
class Word {
	static readonly words: Word[] = [];

	readonly id: number;
	readonly name: string;
	readonly langId: number;
	readonly transcription: string;

	constructor(id, name, langId, transcription) {
		this.id = id;
		this.name = name;
		this.langId = langId;
		this.transcription = transcription;
	}

	static addWord(w: Word) { this.words.push(w); }
}

class Translation {
	static readonly translations: Translation[] = [];

	readonly id: number;
	readonly idWord: number;
	readonly idTranslation: number;
	readonly idCategory: number;

	constructor(id, idWord, idTranslation, idCategory) {
		this.id = id;
		this.idWord = idWord;
		this.idTranslation = idTranslation;
		this.idCategory = idCategory;
	}

	static addTranslation(t: Translation) { this.translations.push(t); }
}

class Category {
	static readonly categories: Category[] = [];
	readonly id: number;
	readonly name: string;

	constructor(id, name) {
		this.id = id;
		this.name = name;
	}

	static addCategory(c: Category) { this.categories.push(c); }
}

class EnglishDefinition {
	static readonly records: EnglishDefinition[] = [];

	readonly word: string;
	readonly pronounciation: string;
	readonly definitions: { readonly translations: string[]; readonly partOfSpeech: string; }[] = [];
	
	constructor(word, pronounciation, definitions) {
		this.word = word;
		this.pronounciation = pronounciation;
		this.definitions = definitions;
	}

	static addDefinition(d: EnglishDefinition) { this.records.push(d); }
}
/// END CLASSES

function extractData() {

	// words
	db.each('SELECT * FROM word', function (err, row) {
		const w = new Word(row.id, row.name, row.langId, row.transcription);
		Word.addWord(w);
	});

	// translations
	db.each("SELECT * FROM translation", function (err, row) {
		const t = new Translation(row.id, row.idWord, row.idTranslation, row.idCategory);
		Translation.addTranslation(t);
	});
		
	// categories
	db.each("SELECT * FROM category", function (err, row) {
		const c = new Category(row.id, row.name);
		Category.addCategory(c);

	// process
	processData();
	});
}

db.serialize(extractData);
db.close();

function processData() {
	console.log(Word.words.slice(0, 20));
	console.log(Translation.translations.slice(0, 20));
	console.log(Category.categories);
}