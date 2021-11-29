"use strict";

function tweetzhot(config) {
    return async_tweetzhot(config);
}

module.exports = tweetzhot;


async function async_tweetzhot(config) {

    function status(text) { if (config.statusFunction) config.statusFunction(text); }

    const validTweetURL = /^https:\/\/twitter\.com\/([^\/]+)\/status\/(\d+)$/;

    // Test 'tweet' to see if URL or ID
    if (config.tweet.match(/^\d+$/)) {
        config.url = `https://twitter.com/dummy/status/${config.tweet}`;
    } else {
        config.url = config.tweet;
    }
    if (config.url.match(/^twitter\.com/)) config.url = `https://${config.url}`;
    if (!config.url.match(validTweetURL)) {
        throw new Error('Not a valid tweet ID or URL.');
    }

    if (!config.viewportWidth) {
        // Cannot use yargs default because then .conflicts doesn't work
        config.width = config.width ? config.width : 598;
        config.viewportWidth = config.width < 530 ? config.width + 70 : config.width + 90;
    }
    
    config.defaultViewport = {
        'width': config.viewportWidth,
        'height': config.height ? config.height : 2400
    }

    config.args = [
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        ' --disable-site-isolation-trials'
    ];

    config.extraHTTPHeaders = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.0 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.9,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,en;q=0.8',
        'Access-Control-Allow-Origin': '*'
    };

    // This is what gets evaluated in the page context
    config.evaluate = (config) => {
        var r = {};
        r.cancelScreenshot = true;
        r.error = 'An unknown error has ocurred';
        for (const span of document.querySelectorAll('span')) {
            // The tweet we want is an article tag in a > 20px fontSize span
            if (parseFloat(window.getComputedStyle(span).fontSize) > 20) {
                const tweet = span.closest("article");
                if (tweet) {
                    tweet.classList.add('thisTweet');
                    delete r.error;
                    delete r.cancelScreenshot;
                    r.tweet = {};
                    var url = document.location.href;
                    console.log(url)
                    try {
                        [ r.tweet.url, r.tweet.user, r.tweet.id ] = url.match(
                            /^https:\/\/twitter\.com\/([^\/]+)\/status\/(\d+)$/
                        );
                    } catch {
                        r.error = 'Could not parse response.';
                    }

                    const langdiv = tweet.querySelector('div[lang]');
                    if (langdiv) {
                        r.tweet.language = langdiv.getAttribute('lang');
                    }


                    // Cut off replies, likes, etc if config.cutStats is set
                    if (config.cutStats) {
                        const selector = '.thisTweet>div>div>div>div>div';
                        for (const div of document.querySelectorAll(selector)) {
                            if (parseFloat(window.getComputedStyle(div).marginBottom) > 10) {
                                while (div.nextElementSibling) div.nextElementSibling.remove();
                                break;
                            }
                        }
                    }

                    // Remove the 'more' (three dots) button
                    const more = document.querySelector('.thisTweet div[aria-label=More]');
                    if (more) more.remove();

                    break;
                }
            }
        }
        if (r.error) {
            // No tweet was found. Let's see if we can refine the error 
            // with something twitter said.
            const errorSelector = 'div[data-testid="error-detail"] span span, article';
            errorSpan = document.querySelector(errorSelector);
            if (errorSpan) r.error = errorSpan.textContent.replace(/Learn more$/,'');;
        }
        return r;
    };

    config.selector = '.thisTweet';

    // Everything is set up for zhot, now go get the tweet
    var r = await require('zhot')(config);

    if (r.error) throw new Error(r.error);

    r.image = require('image-size')(config.outputFile);
    status(`Image size: ${r.image.width} x ${r.image.height}`);
    r.image.file = config.outputFile;

    return Promise.resolve(r);

}
