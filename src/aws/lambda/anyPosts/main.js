// Lambda Handler for a Specific category of data.
// In the real world, this should probably be a seperate handlers per method
// METHOD	         API     URL
// create	         POST    http://myapi/posts
// delete	         DELETE  http://myapi/posts/UUID
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&title=bar
// getOne	         GET     http://myapi/posts/UUID
// getMany	         GET     http://myapi/posts?id=UUID&id=UUID&id=UUID
// update	         PUT     http://myapi/posts/UUID
// updateMany	     PUT     http://myapi/posts/UUID, PUT http://my.api.url/posts/UUID, PUT http://my.api.url/posts/UUID

const { getOne, getMany } = require('./handlers/Get.js');
const { createOne } = require('./handlers/Post.js');
const { deleteOne } = require('./handlers/Delete.js');
const { updateOne } = require('./handlers/Put.js');


exports.handler = async (event) => {
    let statusCode = 200;
    let body="";
    let result
    let headers = {"Content-Type": "application/json"};

    console.log("User:", event.requestContext.authorizer.jwt.claims.username, "has requested:", event.requestContext.http.method, event.requestContext.http.path)

    try {
        switch (event.requestContext.http.method) {
            // Create
            case "POST":
                result = await createOne(event.body);
                break;

            // Read
            case "GET":
                if ("pathParameters" in event && event.pathParameters.proxy != "") {
                    result = await getOne(event.pathParameters.proxy);
                    break;
                } else {
                    result = await getMany(event.queryStringParameters);
                    break;
                }

            // Update
            case "PUT":
                if ("pathParameters" in event && event.pathParameters.proxy != "") {
                    result = await updateOne(event.pathParameters.proxy, event.body);
                    break;
                }

            // Delete
            case "DELETE":
                if ("pathParameters" in event && event.pathParameters.proxy != "") {
                    result = await deleteOne(event.pathParameters.proxy);
                    break;
                }

            default:
                throw new Error(`Unsupported method: "${requestContext.http.method}"`);
        }

    } catch (err) {
        statusCode = 400;
        body = err.message;

    } finally {
        if (typeof result.body === 'object') {
            headers["X-Total-Count"] = result.body.length;
        }
        statusCode = result.statusCode;
        body = JSON.stringify(result.body, null, 4);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
