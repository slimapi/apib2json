FORMAT: 1A

# Spaces VS Tabs
Put TAB 	 AND also   space.

# Group

## Foo [/backend/v1/foo]
### Bar [PUT /backend/v1/foo/bar]
+ Request Success (application/json)
    + Attributes
        + login: username (string, required)
        + password: pwd (string, required)

+ Response 200 (application/json)
    + Attributes
        + access_token: `xxx` (string)
