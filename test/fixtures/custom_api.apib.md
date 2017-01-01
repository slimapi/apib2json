FORMAT: 1A

# Custom API

## API Blueprint
+ [Link to Apiary](http://docs.customapi1.apiary.io/)

# Group Backend

## Account [/backend/v1/account]
### Login [PUT /backend/v1/account/login]
+ Request Success (application/json)
    + Attributes
        + login: username (string, required)
        + password: pwd (string, required)

+ Response 200 (application/json)
    + Attributes
        + access_token: `xxx` (string)

+ Request Bad Credentials (application/json)
    + Attributes
        + login: username (string, required)
        + password: pwd (string, required)

+ Response 401 (application/json)
    + Attributes
        + code: `401` (number, required)
        + error: `AUTH_FAILED` (string, required)
        + message: `Invalid login or password` (string, required)

### Me [GET /backend/v1/account/me]
+ Request (application/json)
    + Headers

            Authorization: Bearer <access_token>

+ Response 200 (application/json)
    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "properties": {
                    "id": {
                        "type": "number"
                    },
                    "first_name": {
                        "minLength": 1,
                        "type": "string"
                    },
                    "last_name": {
                        "minLength": 1,
                        "type": "string"
                    }
                }
            }
            
# Group Frontend

## Article [/frontend/v1/articles]
+ Attributes (object)
    + id: 250FF (string, required)
    + title: `Some title` (string, required)

### Retrieve articles [GET]
+ Response 200 (application/json)
    + Attributes (Article)
