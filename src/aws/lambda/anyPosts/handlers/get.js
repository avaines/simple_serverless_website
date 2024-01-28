// METHOD	         API     URL
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&_start=0&_end=24&title=bar
// getOne	         GET     http://myapi/posts/123
// getMany	         GET     http://myapi/posts?id=123&id=456&id=789
// getManyReference	 GET     http://myapi/posts?author_id=345

// import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

// export const getMany = async (tableName) => {
//     const body = await dynamo.send(
//         new ScanCommand({ TableName: tableName })
//     );
//     return body.Items;
// };

// export const getOne = async (event, tableName) => {
//   const body = await dynamo.send(
//     new GetCommand({
//          TableName: tableName,
//         Key: {
//             id: event.pathParameters.id,
//         },
//     })
//     );
//     return body.Item;
// };


export const getOne = async (tableName, id) => {
    console.log("table:", tableName, " IdParam:", id)
    if (tableName == "mock") {
        console.log("loading from mocked data")
        const sampleData = require('./example-data.json');
    
        const item = sampleData.find(item => item.id === parseInt(id));

        if (!post) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Post not found' })
            };
        }
        return {
            statusCode: 200, 
            body: JSON.stringify(post)
        };

    } else {
        console.log("loading from DynamoDB")
        const body = await dynamo.send(
            new GetCommand({
                TableName: tableName,
                Key: {
                    id: event.pathParameters.id,
                },
            })
        );
    }
    return {
        statusCode: 200, 
        body: body.Item
    };
};
