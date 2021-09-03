/**
 * This file is part of the apib2json
 *
 * Copyright (c) 2021 Petr Bugyík
 *
 * For the full copyright and license information, please view
 * the file LICENSE.md that was distributed with this source code.
 */

const Protagonist = require('protagonist');

class Apib2Json {
    /**
     * @param {Object} options
     */
    constructor(options = {}) {
        this.defaults = {
            debug: false,
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
        /* istanbul ignore next */
        this.options.debug && this.options.logger(...args);
    }

    /**
     * @param {String} apib
     * @returns {Promise}
     */
    toArray(apib) {
        const that = this;
        return new Promise((resolve, reject) => {
            const data = {};
            const result = Protagonist.parseSync(apib, { requireBlueprintName: true });

            // console.log(JSON.stringify(result, null, 4));
            // process.exit(1);

            if (result.content.length === 1 && result.content[0].element === 'annotation') {
                reject(new SyntaxError(result.content[0].content));
                return;
            }

            result.content.forEach((content) => {
                /* istanbul ignore if: tired of writing tests */
                if (content.element !== 'category') {
                    return;
                }

                content.content.forEach((category) => {
                    let group = null;
                    if (['category', 'resource'].includes(category.element)) {
                        group = category.meta.title
                            ? category.meta.title.content
                            : null;
                    } else {
                        return;
                    }

                    if (group !== null) {
                        this.log('GROUP: %s', group);
                    }

                    let catResContent = category.content;
                    if (category.element === 'resource') {
                        catResContent = [];
                        catResContent.push(
                            {
                                element: 'resource',
                                attributes: category.attributes,
                                content: category.content,
                            }
                        );
                    }

                    catResContent.forEach((resource) => {
                        /* istanbul ignore if: tired of writing tests */
                        if (resource.element !== 'resource') {
                            return;
                        }

                        let path = resource.attributes.href.content;
                        resource.content.forEach((transition) => {
                            if (transition.element !== 'transition') {
                                return;
                            }

                            if (transition.attributes && transition.attributes.href) {
                                path = transition.attributes.href.content;
                            }

                            transition.content.forEach((httpTransaction) => {
                                if (httpTransaction.element !== 'httpTransaction') {
                                    return;
                                }

                                httpTransaction.content.forEach((httpTransactionType) => {
                                    const type = httpTransactionType.element === 'httpRequest'
                                        ? 'request'
                                        : 'response';

                                    let title = null;
                                    if (httpTransactionType.meta && httpTransactionType.meta.title) {
                                        title = httpTransactionType.meta.title.content;
                                    } else if (transition.meta && transition.meta.title) {
                                        title = transition.meta.title.content;
                                    }

                                    const method = httpTransaction.content[0].attributes.method.content;
                                    const endpoint = `[${method}]${path}`;
                                    this.log('%s: [%s %s]', type.toUpperCase(), method, path);

                                    httpTransactionType.content.forEach((asset) => {
                                        if (asset.element !== 'asset'
                                            || !asset.attributes
                                            || !asset.attributes.contentType
                                            || asset.attributes.contentType.content !== 'application/schema+json'
                                        ) {
                                            return;
                                        }

                                        if (!Object.prototype.hasOwnProperty.call(data, endpoint)) {
                                            data[endpoint] = [];
                                        }

                                        const item = {
                                            meta: {
                                                type,
                                                title,
                                                group,
                                            },
                                            schema: asset.content,
                                        };

                                        if (type === 'response' && httpTransactionType.attributes.statusCode) {
                                            item.meta.statusCode = httpTransactionType.attributes.statusCode.content;
                                        }

                                        data[endpoint].push(item);
                                    });
                                });
                            });
                        });
                    });
                });
            });

            if (that.options.debug) {
                const counter = { endpoints: 0, transactions: 0 };
                Object.keys(data).forEach((key) => {
                    counter.endpoints += 1;
                    counter.transactions += Object.keys(data[key]).length;
                });

                that.log(
                    'DONE: Found %i endpoints (%i transactions) with JSON Schema.',
                    counter.endpoints,
                    counter.transactions
                );
            }

            resolve(data);
        });
    }

    /**
     * @param {String} apib
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
