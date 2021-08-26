/**
 * This file is part of the apib2json
 *
 * Copyright (c) 2019 Petr Bugyík
 *
 * For the full copyright and license information, please view
 * the file LICENSE.md that was distributed with this source code.
 */

const Util = require('util');
const Protagonist = require('protagonist');

class Apib2Json {
    /**
     * @param Object options
     */
    constructor(options = {}) {
        this.defaults = {
            verbose: false,
            pretty: false,
            indent: 2,
            logger: console.log, // eslint-disable-line no-console
        };

        this.options = Object.assign(this.defaults, options);
    }

    /**
     * @param args
     */
    log(...args) {
        this.options.verbose && this.options.logger(...args);
    }

    /**
     * @param String apib
     * @returns {Promise}
     */
    toArray(apib) {
        return new Promise((resolve, reject) => {
            const data = {};
            const result = Protagonist.parseSync(apib);

            if (result.content[0].element === 'annotation') {
                reject(new Error(result.content[0].content));
                return;
            }

            result.content[0].content.forEach((group) => {
                if (group.element !== 'category') {
                    return;
                }

                group.content.forEach((resource) => {
                    /* istanbul ignore if: tired of writing tests */
                    if (!resource.element || resource.element !== 'resource') {
                        return;
                    }

                    this.log('GROUP: %s', resource.meta.title);

                    resource.content.forEach((transition) => {
                        if (!transition.element || transition.element !== 'transition') {
                            return;
                        }

                        transition.content.forEach((content) => {
                            if (content.element !== 'httpTransaction') {
                                return;
                            }

                            let endpoint;
                            let titleRequest;
                            content.content.forEach((httpTransaction) => {
                                const type = httpTransaction.element;
                                /* istanbul ignore if: tired of writing tests */
                                if (!type in ['httpRequest', 'httpResponse']) {
                                    return;
                                }

                                const isTypeReq = type === 'httpRequest';
                                if (isTypeReq) {
                                    endpoint = Util.format(
                                        '[%s]%s',
                                        httpTransaction.attributes.method.content,
                                        (transition.attributes && transition.attributes.href
                                            ? transition.attributes.href.content
                                            : resource.attributes.href.content)
                                    );

                                    if ('meta' in httpTransaction && 'title' in httpTransaction.meta) {
                                        titleRequest = httpTransaction.meta.title.content;
                                    }
                                }

                                httpTransaction.content.forEach((rContent) => {
                                    const isAsset = rContent.element === 'asset';

                                    if (isAsset
                                        && rContent.attributes.contentType.content === 'application/schema+json') {
                                        if (!Object.prototype.hasOwnProperty.call(data, endpoint)) {
                                            data[endpoint] = [];
                                        }

                                        const item = {
                                            meta: {
                                                type: (isTypeReq ? 'request' : 'response'),
                                                title: null,
                                            },
                                            schema: rContent.content,
                                        };

                                        if ('meta' in resource && 'title' in resource.meta) {
                                            item.meta.group = resource.meta.title.content;
                                        }

                                        if ('attributes' in httpTransaction
                                            && 'statusCode' in httpTransaction.attributes) {
                                            item.meta.statusCode = httpTransaction.attributes.statusCode.content;
                                        }

                                        if (titleRequest) {
                                            item.meta.title = titleRequest;
                                        }

                                        data[endpoint].push(item);

                                        this.log('ENDPOINT: %s %s', endpoint, JSON.stringify(item.meta));
                                    }
                                });
                            });
                        });
                    });
                });
            });
            resolve(data);
            this.log('DONE. No other endpoint with JSON Schema definition found.');
        });
    }

    /**
     * @param String apib
     * @returns {Promise}
     */
    toJson(apib) {
        return this.toArray(apib)
            .then((result) => {
                const data = {};
                Object.keys(result).forEach((endpoint) => {
                    const items = result[endpoint];
                    if (!Object.prototype.hasOwnProperty.call(data, endpoint)) {
                        data[endpoint] = [];
                    }

                    items.forEach((item) => {
                        const i = item;
                        i.schema = JSON.parse(i.schema);
                        data[endpoint].push(i);
                    });
                });

                return this.options.pretty
                    ? JSON.stringify(data, null, this.options.indent)
                    : JSON.stringify(data);
            });
    }
}

module.exports = Apib2Json;
