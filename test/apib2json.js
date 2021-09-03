/**
 * This file is part of the apib2json
 *
 * Copyright (c) 2021 Petr Bugyík
 *
 * For the full copyright and license information, please view
 * the file LICENSE.md that was distributed with this source code.
 */

const Assert = require('assert');
const Test = require('./test');

Test.shouldPass('without-attributes');
Test.shouldPass('advanced_attributes_api', { pretty: true });
Test.shouldPass('custom_api', { pretty: true, indent: 4 });
Test.shouldPass('custom_api', { pretty: false });
Test.shouldPass('custom_api', { debug: true, logger: () => {} });

Test.apib2json(undefined, 'AAA')
    .then(() => {
        Test.fail('bad_input');
    })
    .catch((res) => {
        Assert.equal(res.message, 'expected API name, e.g. \'# <API Name>\'');
        Test.pass('bad_input');
    });

Test.apib2json(undefined, Test.fixture('parse_error.md'))
    .then(() => {
        Test.fail('parse_error');
    })
    .catch((e) => {
        Assert.equal(e.message, 'base type \'BAD\' is not defined in the document');
        Test.pass('parse_error');
    });

Test.apib2json(undefined, Test.fixture('spaces_vs_tabs_api.apib.md'))
    .then(() => {
        Test.fail('spaces_vs_tabs');
    })
    .catch((e) => {
        Assert.equal(
            e.message,
            "the use of tab(s) '\\t' in source data isn't currently supported, please contact makers"
        );
        Test.pass('spaces_vs_tabs');
    });
