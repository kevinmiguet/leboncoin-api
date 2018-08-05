const cheerio = require('cheerio');
const request = require('request');
const item = require('./item');
const cleanString = require('./utils').cleanString;
const convertStringDateToDate = require('./utils').convertStringDateToDate;

class Search {
    constructor(options) {
        if (!(this instanceof Search))
            return new Search(options);
        this.searchExtras = {};
        options = options || {};

        this.setMaxPrice(options.maxPrice);
        this.setMinSize(options.maxPrice);
        this.setLocation(options.location);
        this.setPage(options.page);
        if (options.searchExtras && options.searchExtras instanceof Object) {
            for (const i in options.searchExtras) {
                if (!options.searchExtras.hasOwnProperty(i)) {
                    continue;
                }
                this.addSearchExtra(i, options.searchExtras[i]);
            }
        }
    }
    setMaxPrice(maxPrice){
        if (!!maxPrice){
            this.maxPrice = maxPrice;
        }
        return this;
    }
    setMinSize(minSize){
        if (!!minSize){
            this.minSize = minSize;
        }
        return this;
    }
    setLocation(location) {
        if (!!location) {
            this.location = location;
        }
        return this;
    }

    setPage(page) {
        if (parseInt(page) == page) {
            this.page = page;
        }
        return this;
    }

    getUrl() {
        const CONSTS = {
            hostname: "www.pap.fr",
            protocol: "https",
            pathname: "/annonce/",
        }

        const {hostname, protocol, pathname} = CONSTS
        let queryString = '';
        // location or buy
        if (this.category) {
            queryString += `${category}-`
        }
        queryString += 'appartement-maison-';
        queryString += 'paris-75-g439-'
        if (this.pieces) {
            queryString += `${this.pieces}-pieces-`
        }
        if (this.chambres) {
            queryString += `a-partir-de-${this.chambres}-chambres-`
        }
        if (this.maxPrice) {
            queryString += `jusqu-a-${this.maxPrice}-euros-`
        }
        if (this.minSize){
            queryString += `a-partir-de-${this.minSize}-m2-`            
        }
        if (this.page){
            queryString += `${this.page}`            
        }   
        
        return `${protocol}://${hostname}${pathname}${queryString}`;
    }

    run(url) {
        const self = this;
        if (url == null) {
            url = this.getUrl();
        }
        return new Promise((resolve, reject) => {
            request.get({
                uri: url,
                encoding: null,
                gzip: true
            }, function (err, res, body) {
                if (err) {
                    return reject(err);
                }
                const opts = {
                    normalizeWhitespace: true,
                    decodeEntities: true
                };
                // load the html page in cheerio
                const $ = cheerio.load(body, opts);
                const output = {
                    page: self.page,
                    nbResult: parseNbResult($),
                    results: parseEntries($)
                };
                resolve(output);
            });
        });
    }
}

Search.prototype.query = null;
Search.prototype.category = null;
Search.prototype.region = null;
Search.prototype.department = null;
Search.prototype.location = null;
Search.prototype.page = 1;

const parseNbResult = function ($) {
    return parseInt($('.tabsHeader .active .tabsSwitchNumbers').text().replace(/ /g, ''));
};

const PARSERS = {
    title: $ => $.find('.item-title > .h1').text(),
    date: $ => convertStringDateToDate($.find('item-date').split('/')[2]),
    images: $ => [$.find('.item-photo-count > img').attr('src')],
    link: $ => $.find('.item-title').attr('href'),
    location: $ => cleanString($.find('.item-description').text().split('.')[0]), 
    price: $ => parseInt(cleanString($.find('.item-price > span').text().replace(/[ E€]/g, ''))),
}
const SELECTORS = {
    // selectors for an item in the search page
    item : '.search-list-item',
}
const parseEntries = function ($) {
    const output = [];
    // 
    $(SELECTORS.item).each(function (index, entry) {
        const $entry = $(entry);
        const title = PARSERS.title($entry);
        const date = PARSERS.date($entry);
        const images = PARSERS.images($entry);
        const link = PARSERS.link($entry);
        const location = PARSERS.location($entry);
        const price = PARSERS.price($entry);

        output.push(new item.Item({
            title: title,
            category: category,
            link: link,
            images: images,
            location: location,
            urgent: urgent,
            price: price,
            date: date
        }));
    });

    return output;
};


module.exports.Search = Search;

// These are exported for testing
module.exports.convertStringDateToDate = convertStringDateToDate;
module.exports.parseDate = parseDate;
module.exports.parseNbResult = parseNbResult;
module.exports.parseImages = parseImages;
module.exports.parseTitle = parseTitle;
module.exports.parseLocation = parseLocation;
module.exports.parseIsUrgent = parseIsUrgent;
module.exports.parsePrice = parsePrice;
module.exports.parseEntries = parseEntries;
