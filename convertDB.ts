const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./resources/original.db', sqlite3.OPEN_READONLY);
const _ = require('lodash');
const fs = require('fs');

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
  
  const newTranslations: { (key: string): Translation[] } = _.groupBy(Translation.translations, ((tr: Translation) => tr.idWord));
  
  const inversedIndexWords = {};
  Word.words.forEach((word: Word, ind: number) => {
    inversedIndexWords[word.id] = ind;
  });

  function findWord(id: number): Word {
    return Word.words[inversedIndexWords[`${id}`]] || new Word(0, '', 0, '');
  }

  console.log(Object.keys(newTranslations).length);
  const filteredTranslations = [];
  Object.values(newTranslations).forEach((translation: Translation[]) => {
    const origin = findWord(translation[0].idWord);
    if (origin.langId === Languages.English) {
      filteredTranslations.push(translation);
    }
  });
  
  const dictionary = [];
  filteredTranslations.forEach((translation: Translation[]) => {
    const origin = findWord(translation[0].idWord);
    const lookup = origin.name;
    const pronounciation = origin.transcription;
    const definitions = {};
    translation.forEach(def => {
      const c = definitions[def.category];
      if (c) {
        c.push(findWord(def.idTranslation).name);
      } else {
        definitions[def.category] = [findWord(def.idTranslation).name];
      }
    });
    dictionary.push({ lookup, pronounciation, definitions });
  });
  
  fs.writeFileSync('resources/db.json', JSON.stringify(dictionary));
  // console.log(dictionary.filter(dic => dic.lookup === 'top')[0]);
}
