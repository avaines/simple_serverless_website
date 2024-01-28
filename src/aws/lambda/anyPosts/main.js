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

// import * as deleteHandler from './handlers/delete';
// import * as putHandler from './handlers/put';
// import * as defaultHandler from './handlers/default';

import {getOne, getMany} from './handlers/get';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLENAME || "mock";


export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  console.log("event:", event)
  console.log("context:", context)

    try {
        switch (event.routeKey) {
            case "GET /posts/{id}":
                const id = event.pathParameters.id || null
                statusCode, body = await getOne(tableName, id);
                break;

            case "GET /posts":
                body = await getMany(tableName);
                break;
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
                throw new Error(`Unsupported route: "${event.routeKey}"`);
        
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;

    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
