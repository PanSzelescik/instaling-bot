const {get} = require('axios');
const config = require('../config/Config.json');
const words = require('../config/SavedWords.json');
const {useFeature} = require('./helpers.js');
const {Agent} = require('https');
const {writeFile} = require('fs/promises');

const agent = new Agent({
    rejectUnauthorized: false
});

async function getAllWords() {
    if (useFeature()) {
        const {data} = await get('https://api.crawcik.space/instaling.php', {
            httpsAgent: agent,
            params: {
                user: config.feature.user,
                pass: config.feature.password,
                type: 'select'
            }
        });
        return data
    }
    return words;
}

async function getWord(polish, sentence) {
    if (!polish || !sentence) {
        console.error(new TypeError(`Tried to get word using nullish value! Aborting!`));
        console.error({polish, sentence});
    }

    if (useFeature()) {
        const {data} = await get('https://api.crawcik.space/instaling.php', {
            httpsAgent: agent,
            params: {
                user: config.feature.user,
                pass: config.feature.password,
                type: 'select',
                pol: polish,
                sentence: sentence
            }
        });
        return data
    }
    return words.filter(obj => obj.polish === polish);
}

async function insertWord(polish, english, sentence) {
    if (!polish || !english || !sentence) {
        console.error(new TypeError(`Tried to insert nullish value! Aborting!`));
        console.error({polish, english, sentence});
    }

    if (useFeature()) {
        const {data} = await get('https://api.crawcik.space/instaling.php', {
            httpsAgent: agent,
            params: {
                user: config.feature.user,
                pass: config.feature.password,
                type: 'insert',
                pol: polish,
                eng: english,
                sentence: sentence
            }
        });
        return data;
    }
    return words.push({polish, english, sentence});
}

async function saveWords() {
    return writeFile('../config/SavedWords.json', JSON.stringify(words, null, 4), {encoding: 'utf8'})
}

module.exports = {
    getAllWords: getAllWords,
    getWord: getWord,
    insertWord: insertWord,
    saveWords: saveWords
};
