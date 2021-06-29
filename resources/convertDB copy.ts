var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./resources/original.db', sqlite3.OPEN_READONLY);

enum Languages {
	Hebrew, English
}
let langs = Object.values(Languages);
const languages = langs.slice(0, Math.ceil(langs.length/2));

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

	static getWord(id: number): Word { return this.words.filter(c => c.id === id)[0] || new Word(0, '', 0, ''); }
	static addWord(w: Word) { this.words.push(w); }
}

class Translation {
	static readonly translations: Translation[] = [];

	readonly id: number;
	readonly idWord: number;
	readonly idTranslation: number;
	readonly category: string;

	constructor(id, idWord, idTranslation, idCategory) {
		this.id = id;
		this.idWord = idWord;
		this.idTranslation = idTranslation;
		this.category = Category.getCategory(idCategory);
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

	static getCategory(id: number): string { return this.categories.filter(c => c.id === id)[0].name || ''; }
	static addCategory(c: Category) { this.categories.push(c); }
}

class EnglishDefinition {
	static readonly records: EnglishDefinition[] = [];

	readonly word: string;
	readonly pronounciation: string;
	readonly definitions: { readonly translations: string[]; readonly partOfSpeech: string; }[] = [];
	
	constructor(word, pronounciation) {
		this.word = word;
		this.pronounciation = pronounciation;
	}

  addDefinitionTrans(partOfSpeech: string, idTranslation: number): void {
    const translation: string = Word.getWord(idTranslation).name;
		const a = this.definitions.filter(def => def.partOfSpeech === partOfSpeech);
		if (a.length > 0) {
			a[0].translations.push(translation);
		} else {
			a.push({ partOfSpeech, translations: [translation] });
		}
	}

	static isWordExist(id: number): boolean { return this.records.filter((r: EnglishDefinition) => r.word === Word.getWord(id).name).length > -1; }
	static getDefinition(idWord: number): EnglishDefinition { const word = Word.getWord(idWord).name; return this.records.filter(record => record.word === word)[0] || new EnglishDefinition('', ''); }
	static addDefinition(d: EnglishDefinition) { this.records.push(d); }
}
/// END CLASSES

function extractData() {
	
	// categories
	db.each("SELECT * FROM category", function (err, row) {
		const c = new Category(row.id, row.name);
		Category.addCategory(c);
	});

	// words
	db.each('SELECT * FROM word', function (err, row) {
		const w = new Word(row.id, row.name, row.langId, row.transcription);
		Word.addWord(w);
	});

	// translations
	db.each("SELECT * FROM translation", function (err, row) {
		const t = new Translation(row.id, row.idWord, row.idTranslation, row.idCategory);
		Translation.addTranslation(t);
		
	// process
	}, function() {
		processData();
	});
}

db.serialize(extractData);
db.close();

function processData() {
  Translation.translations.forEach((translation: Translation, index: number) => {
    if (index < 500) {
      if (Word.getWord(translation.idWord).langId === Languages.English) {
        console.log(translation.id);
        let definition: EnglishDefinition;
        // A word is in English
        if (!EnglishDefinition.isWordExist(translation.idWord)) {
          // The word is not already registered
          definition = EnglishDefinition.getDefinition(translation.idWord);
        } else {
          const origin = Word.getWord(translation.idWord);
          definition = new EnglishDefinition(origin.name, origin.transcription);
          EnglishDefinition.addDefinition(definition);
        }
        definition.addDefinitionTrans(translation.category, translation.idTranslation);

      }
    }
  });
  
  console.log(EnglishDefinition.records);
}