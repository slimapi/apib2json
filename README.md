# apib2json
[![build status][img-build-status]][link-build-status]
[![code coverage][img-coverage]][link-coverage]
![version][img-version]
[![docker pulls][img-docker-layers]][link-microbadger]
[![docker pulls][img-docker-pulls]][link-registry]

A command-line utility to convert API Blueprint to JSON Schema.

## Introduction

If you are building your API with [Apiary][link-apiary] you should know [API Blueprint][link-apib], right? Good documentation is cool but it would be nice to re-use your validation which you already wrote in [MSON][link-mson] (or [JSON Schema][link-json-schema]). So there is the task: *Convert Blueprint to JSON Schema*. This tool is specially for it.
  
It is built on top of [apiaryio/protagonist][link-protagonist] which do hard job, but if you know this Node.js C++ binding you sure know that compilation of this library (`npm install protagonist`) takes time. This is the reason why this tool is also wrapped with [Docker][link-docker], but sure you can also use it via `npm`.

## Installation

```bash
$ npm install --global apib2json
```

> **NOTE**: Recommended way is using a dockerized version, just try `$ docker run bugyik/apib2json --help`

## Usage

**$ apib2json --help**

```bash
Usage: apib2json [options]

A command-line utility to convert API Blueprint to JSON Schema

Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -v, --verbose        Verbose mode, use with --output - default: false
    -p, --pretty         Output pretty (indented) JSON - default: false
    --indent <n>         Number of space characters used to indent code, use with --pretty - default: 2
    -i, --input <file>   Path to input (Apib) file - default: STDIN
    -o, --output <file>  Path to output (JSON) file - default: STDOUT
```

## Example

> **NOTE**: The example below requires `docker` installed (npm's version without prefix `docker run -i bugyik/`) 

```bash
$ docker run -i bugyik/apib2json --pretty < input.apib > output.json
``` 

**$ cat input.apib**
```
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
        "title": null
      },
      "schema": {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "created": {
            "type": "number",
            "description": "Time stamp"
          },
          "percent_off": {
            "type": "number",
            "description": "A positive integer between 1 and 100 that represents the discount the coupon will apply."
          },
          "redeem_by": {
            "type": "number",
            "description": "Date after which the coupon can no longer be redeemed"
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

Pull Requests are welcome! 

Do you hate contributing to projects where you have to install direct version of Node.js? I know there are tools like [nvm][link-nvm] but there is also Docker to rescue! To begin developing, you just need `docker` and `docker-compose` installed and do this: 

```bash
$ git clone git@github.com:o5/apib2json.git && cd apib2json/
$ docker-compose up
```

#### Do you need to go inside the container?
```bash
$ docker exec -it apib2json sh
```
> **NOTE**: Assumes `docker-composer up` was finished.

## License
MIT @ [Petr Bugyík][link-twitter]

[link-build-status]: https://travis-ci.org/o5/apib2json
[link-coverage]: https://coveralls.io/github/o5/apib2json
[link-protagonist]: https://github.com/apiaryio/protagonist
[link-apiary]: https://apiary.io
[link-apib]: https://github.com/apiaryio/api-blueprint
[link-mson]: https://github.com/apiaryio/mson
[link-json-schema]: http://json-schema.org
[link-docker]: https://www.docker.com/products/overview
[link-registry]: https://hub.docker.com/r/bugyik/apib2json
[link-microbadger]: https://microbadger.com/images/bugyik/apib2json
[link-issue]: https://github.com/o5/apib2json/issues
[link-nvm]: https://github.com/creationix/nvm
[link-twitter]: https://twitter.com/bugyik

[img-build-status]: https://img.shields.io/travis/o5/apib2json/master.svg
[img-coverage]: https://img.shields.io/coveralls/o5/apib2json.svg
[img-version]: https://images.microbadger.com/badges/version/bugyik/apib2json.svg
[img-docker-pulls]: https://img.shields.io/docker/pulls/bugyik/apib2json.svg
[img-docker-layers]: https://images.microbadger.com/badges/image/bugyik/apib2json.svg
