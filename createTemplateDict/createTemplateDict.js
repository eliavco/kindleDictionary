var fs = require('fs');
var Definition = /** @class */ (function () {
    function Definition(lookup, pronounciation, definitions) {
        this.lookup = lookup;
        this.pronounciation = pronounciation.substring(0, pronounciation.length - 1).substring(1);
        this.definitions = definitions;
    }
    Definition.prototype.getTemplate = function () {
        var _this = this;
        var translations = Object.keys(this.definitions).map(function (def) {
            var translationTemplate = "<li class=\"translation\"><div class=\"partofspeech\">" + (def ? def + ":" : '') + "</div><p class=\"hebrew\">" + _this.definitions[def].join(', ') + "</p></li>";
            return translationTemplate;
        }).join('');
        var template = "<idx:entry name=\"default\" scriptable=\"yes\" spell=\"yes\"><div class=\"definition\"><div class=\"origin\"><h3 class=\"lookup\"><idx:orth>" + this.lookup + "</idx:orth></h3><p class=\"pronounciation\">/" + this.pronounciation + "/</p></div><ol>" + translations + "</ol></div></idx:entry><hr/>";
        return template;
    };
    return Definition;
}());
var dictionary = JSON.parse(fs.readFileSync('../resources/db.json')).map(function (def) { return new Definition(def.lookup, def.pronounciation, def.definitions); });
var template = "<mbp:framset>" + dictionary.map(function (def) { return def.getTemplate(); }).join('') + "</mbp:framset>";
fs.writeFileSync('template.html', template);
