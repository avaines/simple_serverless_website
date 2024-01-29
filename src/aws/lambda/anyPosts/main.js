// Lambda Handler for a Specific category of data.
// In the real world, this should probably be a seperate handlers per method
// METHOD	         API     URL
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&_start=0&_end=24&title=bar
// getOne	         GET     http://myapi/posts/123
// getMany	         GET     http://myapi/posts?id=123&id=456&id=789
// getManyReference	 GET     http://myapi/posts?author_id=345

// create	         POST    http://myapi/posts
// update	         PUT     http://myapi/posts/123
// updateMany	     PUT     http://myapi/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
// delete	         DELETE  http://myapi/posts/123

// import {getOne, getMany} from './handlers/get.js';
const { getOne, getMany } = require('./handlers/get.js');


exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    let headers = {}

    try {
        switch (event.requestContext.http.method) {
            case "GET":
                if ("proxy" in event.pathParameters) {
                    let result = await getOne(event.pathParameters.proxy);
                    statusCode = result.statusCode
                    body = result.body
                    break;
                } else {
                    let result = await getMany(event.queryStringParameters);
                    statusCode = result.statusCode
                    body = result.body
                    break;
                }

            // case "GET /posts":
            // case "DELETE /posts/{id}":
            //     await dynamo.send(
            //     new DeleteCommand({
            //         TableName: tableName,
            //         Key: {
            //         id: event.pathParameters.id,
            //         },
            //     })
            //     );
            //     body = `Deleted item ${event.pathParameters.id}`;
            //     break;

            // case "GET /posts/{id}":
                // body = await dynamo.send(
                //   new GetCommand({
                //     TableName: tableName,
                //     Key: {
                //       id: event.pathParameters.id,
                //     },
                //   })
                // );
                // body = body.Item;
                // break;

            // case "GET /posts":
                // body = await dynamo.send(
                //   new ScanCommand({ TableName: tableName })
                // );
                // body = body.Items;
                // break;

            // case "PUT /posts":
            //     let requestJSON = JSON.parse(event.body);
            //     await dynamo.send(
            //         new PutCommand({
            //         TableName: tableName,
            //         Item: {
            //             id: requestJSON.id,
            //             price: requestJSON.price,
            //             name: requestJSON.name,
            //         },
            //         })
            //     );
            //     body = `Put item ${requestJSON.id}`;  bt
            //     break;

            default:
                throw new Error(`Unsupported method: "${requestContext.http.method}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;

    } finally {
        body = JSON.stringify(body, null, 4)
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
