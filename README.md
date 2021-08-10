# apib2json
[![build status][img-build-status]][link-build-status]
[![code coverage][img-coverage]][link-coverage]
![version][img-version]
[![docker pulls][img-docker-layers]][link-microbadger]
[![docker pulls][img-docker-pulls]][link-registry]

A command-line utility to convert API Blueprint to JSON Schema.

## Introduction

If you are building your API with [Apiary][link-apiary] you should know [API Blueprint][link-apib], right? Good documentation is cool but it would be nice to re-use your validation which you already wrote in [MSON][link-mson] (or [JSON Schema][link-json-schema]). So there is the task: *Convert Blueprint to JSON Schema*. This tool is specially for it.
  
It is built on top of [apiaryio/protagonist][link-protagonist] which do hard job, but if you know this Node.js C++ binding you sure know that compilation of this library (`npm install protagonist`) takes time. This is the reason why this tool is also wrapped with [Docker][link-docker], but sure you can also use it with [`npm`][link-npm].

## Installation

```bash
$ npm install --global apib2json
```

> **NOTE**: Recommended way is using a dockerized version, just try `$ docker run --rm slimapi/apib2json --help`

## Usage

**$ apib2json --help**

```bash
Usage: apib2json [options]

A command-line utility to convert API Blueprint to JSON Schema

Options:
  -d, --debug          Debug (verbose) mode, use only with --output (default: false)
  -h, --help           Display help for command
  -i, --input <file>   Path to input (Apib) file (default: STDIN)
  --indent <number>    Number of space characters used to indent code, use with --pretty (default: 2)
  -o, --output <file>  Path to output (JSON) file (default: STDOUT)
  -p, --pretty         Output pretty (indented) JSON (default: false)
  -v, --version        Display current version
```

## Example

> **NOTE**: The example below requires `docker` installed (npm's version without prefix `docker run --rm -i slimapi/`)

```bash
$ docker run --rm -i slimapi/apib2json --pretty < input.apib > output.json
``` 

**$ cat input.apib**
```
# Group Coupon

## Coupon [/coupons/{id}]
A coupon contains information about a percent-off or amount-off discount you
might want to apply to a customer.

+ Attributes (object)
    + id: 250FF (string, required)
    + created: 1415203908 (number) - Time stamp
    + percent_off: 25 (number)

        A positive integer between 1 and 100 that represents the discount the coupon will apply.

    + redeem_by (number) - Date after which the coupon can no longer be redeemed

### Retrieve a Coupon [GET]
Retrieves the coupon with the given ID.

+ Response 200 (application/json)
    + Attributes (Coupon)
```

**$ cat output.json**
```json
{
  "[GET]/coupons/{id}": [
    {
      "meta": {
        "type": "response",
        "title": null,
        "group": "Coupon",
        "statusCode": "200"
      },
      "schema": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "created": {
            "type": "number"
          },
          "percent_off": {
            "type": "number"
          },
          "redeem_by": {
            "type": "number"
          }
        },
        "required": [
          "id"
        ]
      }
    }
  ]
}
```

> **NOTE**: More examples of input/ouput are available in [test/fixtures](test/fixtures) folder.

## Contributing

#### Bug Reports & Feature Requests

Please use the [issue tracker][link-issue] to report any bugs or file feature requests.

#### Developing

Pull Requests are welcome! To begin developing, you just need `docker` and `docker-compose` installed and do this:

```bash
$ git clone git@github.com:slimapi/apib2json.git && cd apib2json/
$ docker-compose up
```

#### Do you need to go inside the container?
```bash
$ docker exec -it apib2json sh
```
> **NOTE**: Assumes `docker-composer up` was finished.

## License
MIT @ [Petr Bugyík][link-twitter]

[link-build-status]: https://travis-ci.org/slimapi/apib2json
[link-coverage]: https://coveralls.io/github/slimapi/apib2json
[link-protagonist]: https://github.com/apiaryio/protagonist
[link-apiary]: https://apiary.io
[link-apib]: https://github.com/apiaryio/api-blueprint
[link-mson]: https://github.com/apiaryio/mson
[link-json-schema]: http://json-schema.org
[link-docker]: https://www.docker.com/what-docker
[link-registry]: https://hub.docker.com/r/slimapi/apib2json
[link-microbadger]: https://microbadger.com/images/slimapi/apib2json
[link-issue]: https://github.com/slimapi/apib2json/issues
[link-nvm]: https://github.com/creationix/nvm
[link-twitter]: https://twitter.com/bugyik
[link-npm]: https://www.npmjs.com/package/apib2json

[img-build-status]: https://img.shields.io/travis/slimapi/apib2json/master.svg
[img-coverage]: https://img.shields.io/coveralls/slimapi/apib2json.svg
[img-version]: https://images.microbadger.com/badges/version/slimapi/apib2json.svg
[img-docker-pulls]: https://img.shields.io/docker/pulls/slimapi/apib2json.svg
[img-docker-layers]: https://images.microbadger.com/badges/image/slimapi/apib2json.svg
