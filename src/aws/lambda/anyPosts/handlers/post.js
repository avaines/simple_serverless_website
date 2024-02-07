// METHOD	         API     URL
// create	         POST    http://myapi/posts

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME

exports.create = async (body) => {
    console.log("Creating item", body, "in table", tableName)

    parsedBody = JSON.parse(body)

    const data = await dynamo.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                // userId: Number(parsedBody.userId),
                // title: parsedBody.title,
                // body: parsedBody.body
            },
        })
    );
    

    console.log(data)

    return {
        statusCode: 200, 
        body: data
    };
};
