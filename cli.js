#!/usr/bin/env node

"use strict";


// Makes the error object, which is not enumerable, output JSON
// https://stackoverflow.com/questions/18391212
if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};
        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);
        return alt;
    },
    configurable: true,
    writable: true
});


var tweetzhot = require('./index');

const config = require('yargs')(process.argv.slice(2))
    .usage('$0 <tweet>', '', (yargs) => {
        yargs
        .positional('tweet', {
            describe: 'Twitter URL or ID (digits) of tweet.',
            type: 'string'
        })
    })
    .demand(1)
    .options({
        'w': {
            alias: 'width',
            describe: 'Screenshot width. Defaults to 598px, twitter does not render wider, only narrower.',
            type: 'integer'
        },
        'c': {
            alias: 'cutStats',
            describe: 'Cut off rows for replies, retweets, likes, etc.',
            type: 'boolean'
        },
        'o': {
            alias: 'outputFile',
            default: 'tweet.png',
            describe: 'Filename for screenshot. Formats: png, jpg or webp, selected by extension.',
            type: 'string'
        },
        'j': {
            alias: 'json',
            describe: 'Output information in JSON format.',
            type: 'boolean'
        },
        'q': {
            alias: 'quiet',
            describe: 'Supress status updates',
            type: 'boolean'
        },
        'd': {
            alias: 'debug',
            describe: 'Show browser console and detailed error info.',
            type: 'boolean'
        },
        'W': {
            alias: 'viewportWidth',
            describe: 'Viewport width. Normally you would specify the desired screenshot width instead, but you can set the viewport width instead.',
            type: 'integer'
        },
        'h': {
            alias: 'height',
            describe: 'Viewport height, has to be big enough for tweet to fit.',
            type: 'integer',
            default: 2400
        },
        'H': {
            alias: 'head',
            describe: 'disable headless mode',
            type: 'boolean'
        }
    })
    .conflicts('width', 'viewportWidth')
    .argv
;


if (config.debug) config.consoleFunction = console.log;
if (config.json) config.quiet = true;
if (!config.quiet) config.statusFunction = console.log;
if (config.head) config.headless = false;

tweetzhot(config)
    .then((res) => {
        if (config.json) console.log(JSON.stringify(res, null, 2));
    })
    .catch((e) => {
        if (config.debug) {
            throw (e);
        } else {
            if (!config.quiet) console.log(`Error: ${e.message}`);
            if (config.json) {
                var errorReturn = {};
                errorReturn.error = e;
                console.log(JSON.stringify(errorReturn, null, 2));
            }
            process.exit(1);
        }
    })
;
