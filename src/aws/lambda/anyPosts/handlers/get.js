// METHOD	         API     URL
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&_start=0&_end=24&title=bar
// getOne	         GET     http://myapi/posts/123
// getMany	         GET     http://myapi/posts?id=123&id=456&id=789
// getManyReference	 GET     http://myapi/posts?author_id=345

// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME


exports.getOne = async (id) => {
    console.log("Getting item ", id, "from table", tableName)
    const body = await dynamo.send(
        new GetCommand({
            TableName: tableName,
            Key: {
                id : Number(id)
            },
        })
    );

    return {
        statusCode: 200, 
        body: body.Item
    };
};

exports.getMany = async (tableName) => {
    // const body = await dynamo.send(
    //     new ScanCommand({ TableName: tableName })
    // );
    // return body.Items;
    return {
        statusCode: 201, 
        body: "not implemented yet"
    };

};

