const {writeFile} = require('fs/promises');
const {blue} = require('./printer.js');

class Words extends Map {

    constructor() {
        super();
        this.initializing = true;
        Object.entries(require('../config/Words.json')).forEach(([polish, english]) => this.set(polish, english));
        blue(`[WORDS] Found ${this.size} words in dictionary`);
        this.initializing = false;
    }

    set(polish, english) {
        super.set(polish, english);
        if (!this.initializing) {
            return this.save();
        }
    }

    save() {
        blue('[WORDS] Saving words...');
        const json = {};
        this.forEach((value, key) => json[key] = value);
        return writeFile('config/Words.json', JSON.stringify(json, null, 4));
    }
}

module.exports = new Words();
