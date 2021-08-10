/**
 * This file is part of the apib2json
 *
 * Copyright (c) 2021 Petr Bugyík
 *
 * For the full copyright and license information, please view
 * the file LICENSE.md that was distributed with this source code.
 */

/* eslint-disable no-console, no-path-concat, prefer-template */

const Fs = require('fs');
const Util = require('util');
const Assert = require('assert');
const Apib2Json = require('../lib/apib2json');

const fixtures = __dirname + '/fixtures';

class Test {
    static pass(...args) {
        const a = Util.format(...args);
        console.log(`\x1b[32mPASS:\x1b[0m ${a}`);
    }

    static fail(...args) {
        const a = Util.format(...args);
        console.error(`\x1b[31mFAIL:\x1b[0m ${a}`);
    }

    static fixture(name) {
        return Fs.readFileSync(`${fixtures}/${name}`).toString();
    }

    /**
     * @param {String} spec
     * @param {Object} options
     */
    static shouldPass(spec, options) {
        const curr = `${fixtures}/${spec}.current.json`;
        const apib = Test.fixture(`${spec}.apib.md`);

        Test.apib2json(options, apib)
            .then((res) => {
                Fs.writeFileSync(curr, res);
                let expected = Test.fixture(`${spec}.expected.json`);
                if (!options.pretty) {
                    expected = JSON.stringify(JSON.parse(expected));
                }

                Assert.equal(
                    res,
                    expected
                );
                Test.pass('%s (%s)', spec, JSON.stringify(options));
                Fs.unlinkSync(curr);
            })
            .catch((e) => {
                Test.fail('%s (%s)', spec, JSON.stringify(options));
                console.error(e);
            });
    }

    /**
     *
     * @param options
     * @returns {Promise.<TResult>}
     */
    static apib2json(options, apib) {
        return (new Apib2Json(options))
            .toJson(apib);
    }
}

module.exports = Test;
