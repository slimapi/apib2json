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
            Protagonist.parse(apib, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                result.content[0].content.forEach((group) => {
                    if (!group.meta || group.meta.classes[0] !== 'resourceGroup') {
                        return;
                    }

                    this.log('GROUP: %s', group.meta.title);

                    group.content.forEach((resource) => {
                        /* istanbul ignore if: tired of writing tests */
                        if (!resource.element || resource.element !== 'resource') {
                            return;
                        }

                        resource.content.forEach((transition) => {
                            if (!transition.element || transition.element !== 'transition') {
                                return;
                            }

                            transition.content.forEach((content) => {
                                if (content.element !== 'httpTransaction') {
                                    return;
                                }

                                let endpoint;
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
                                            httpTransaction.attributes.method,
                                            (transition.attributes && transition.attributes.href
                                                ? transition.attributes.href
                                                : resource.attributes.href)
                                        );
                                    }

                                    httpTransaction.content.forEach((rContent) => {
                                        const isAsset = rContent.element === 'asset';
                                        if (isAsset && rContent.attributes.contentType === 'application/schema+json') {
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
                                                item.meta.group = resource.meta.title;
                                            }

                                            if ('attributes' in httpTransaction
                                                && 'statusCode' in httpTransaction.attributes) {
                                                item.meta.statusCode = httpTransaction.attributes.statusCode;
                                            }

                                            if ('meta' in httpTransaction && 'title' in httpTransaction.meta) {
                                                item.meta.title = httpTransaction.meta.title;
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
