// Lambda Handler for a Specific category of data.
// In the real world, this should probably be a seperate handlers per method
// METHOD	         API     URL
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&_start=0&_end=24&title=bar
// getOne	         GET     http://myapi/posts/123
// getMany	         GET     http://myapi/posts?id=123&id=456&id=789 //TODO
// getManyReference	 GET     http://myapi/posts?author_id=345 //TODO

// create	         POST    http://myapi/posts
// update	         PUT     http://myapi/posts/123
// updateMany	     PUT     http://myapi/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
// delete	         DELETE  http://myapi/posts/123

const { getOne, getMany } = require('./handlers/Get.js');
const { create } = require('./handlers/Post.js');


exports.handler = async (event) => {
    let statusCode = 200;
    let body="{}";
    let result
    let headers = {}

    console.log("User:", event.requestContext.authorizer.jwt.claims.username, "has requested:", event.requestContext.http.path)

    try {
        switch (event.requestContext.http.method) {
            case "GET":
                if ("pathParameters" in event && event.pathParameters.proxy != "") {
                    result = await getOne(event.pathParameters.proxy);
                    break;
                } else {
                    result = await getMany(event.queryStringParameters);
                    break;
                }
            
            case "POST":
                result = await create(event.body);
                break;

            default:
                throw new Error(`Unsupported method: "${requestContext.http.method}"`);
        }
    
        
    } catch (err) {
        statusCode = 400;
        body = err.message;
        
    } finally {
        body = JSON.stringify(result.body, null, 4);
        statusCode = result.statusCode;
        headers = { 
            "X-Total-Count": body.length,
            "Content-Type": "application/json"
        };
    }

    return {
        statusCode,
        body,
        headers,
    };
};
