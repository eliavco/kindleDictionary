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
            var translationTemplate = "<li class=\"translation\">\n\t\t\t\t<div class=\"partofspeech\">" + (def ? def + ":" : '') + "</div>\n\t\t\t\t<p class=\"hebrew\">" + _this.definitions[def].join(', ') + "</p>\n\t\t\t</li>";
            return translationTemplate;
        }).join('');
        var template = "<idx:entry name=\"default\" scriptable=\"yes\" spell=\"yes\">\n\t\t\t<div class=\"definition\">\n\t\t\t\t<div class=\"origin\">\n\t\t\t\t\t<h3 class=\"lookup\"><idx:orth>" + this.lookup + "</idx:orth></h3>\n\t\t\t\t\t<p class=\"pronounciation\">/" + this.pronounciation + "/</p>\n\t\t\t\t</div>\n\t\t\t\t<ol>" + translations + "</ol>\n\t\t\t</div>\n\t\t\t</idx:entry><hr/>";
        return template;
    };
    return Definition;
}());
var dictionary = JSON.parse(fs.readFileSync('../resources/db.json')).map(function (def) { return new Definition(def.lookup, def.pronounciation, def.definitions); });
var template = "<mbp:framset>" + dictionary.map(function (def) { return def.getTemplate(); }).join('') + "</mbp:framset>";
fs.writeFileSync('template.html', template);
