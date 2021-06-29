const fs = require('fs');

class Definition {
	readonly lookup: string;
	readonly pronounciation: string;
	readonly definitions: { [key: string]: string[]; };

	constructor(lookup: string, pronounciation: string, definitions: { [key: string]: string[]; }) {
		this.lookup = lookup;
		this.pronounciation = pronounciation.substring(0, pronounciation.length - 1).substring(1);
		this.definitions = definitions;
	}

	getTemplate(): string {
		const translations = Object.keys(this.definitions).map(def => {
			const translationTemplate =
			`<li class="translation">
				<div class="partofspeech">${ def ? `${def}:` : '' }</div>
				<p class="hebrew">${this.definitions[def].join(', ')}</p>
			</li>`;
			return translationTemplate;
		}).join('');

		const template = `<idx:entry name="default" scriptable="yes" spell="yes">
			<div class="definition">
				<div class="origin">
					<h3 class="lookup"><idx:orth>${this.lookup}</idx:orth></h3>
					<p class="pronounciation">/${this.pronounciation}/</p>
				</div>
				<ol>${translations}</ol>
			</div>
			</idx:entry><hr/>`;
		return template;
	}
}

const dictionary: Definition[] = JSON.parse(fs.readFileSync('../resources/db.json')).map(def => new Definition(def.lookup, def.pronounciation, def.definitions));

const template: string = `<mbp:framset>${dictionary.map(def => def.getTemplate()).join('')}</mbp:framset>`;
fs.writeFileSync('template.html', template);
