const XmlEntities = require('html-entities').XmlEntities;
const entities = new XmlEntities();

const cleanString = function(input) {
    const output;
    output = input.replace('&nbsp;', ' ')
                    .replace('&euro;', 'E')
                    .replace(/<script.*?>.*?<\/script>/gim, '')
                    .replace(/<\/?br\/?>/gim, "\n")
                    .replace(/<[^>]*>/g, '')
                    .replace(/\n/g, "<br>").trim();
    output = entities.decode(output);
    return output;
};

const frenchMonth = {
    'jan': 0,
    'fév': 1,
    'mar': 2,
    'avr': 3,
    'mai': 4,
    'juin': 5,
    'jui': 6,
    'aôut': 7,
    'sep': 8,
    'oct': 9,
    'nov': 10,
    'déc': 11,
};

const convertStringDateToDate = function (dateString) {
    const rawDates = dateString.trim().toLowerCase().replace(/[,]/g,'').split(' ');
    const date = new Date();
    const dates = {};
    rawDates.foreach(str =>{
        if (/\d{4}/.test(str)) {
            dates.annee = str;
        } else if (/:/.test(str)){
            dates.heure = str;
        } else if (str => /(\d{2}$)|(aujourd)|(hier)/.test(str)){
            dates.jour = str;
        } else if (str => frenchMonth.findIndex(month => str.includes(month) !== -1)){
            dates.mois = str
        }
    })

    if(dates.jour == 'Aujourd\'hui') {
    // do nothing because Date object is initialized at today
    } else if(dates.jour == 'Hier') {
        date.setDate(date.getDate() - 1);
    } else {
        date.setDate(date.getDate() - 2);
        if (dates.mois) {
            const i = frenchMonth.findIndex(month => dates.mois.includes(month))
            date.setMonth(frenchMonth[i]);
        }
        if (dates.jour){
            date.setDate(parseInt(dates.jour));
        }
    }
    if (dates.heure){
        const time = dates.heure.split(":");
        date.setHours(parseInt(time[0]));
        date.setMinutes(parseInt(time[1]));
        date.setSeconds(0);
    }
    return date;
};

module.exports.cleanString = cleanString;
module.exports.convertStringDateToDate = convertStringDateToDate;