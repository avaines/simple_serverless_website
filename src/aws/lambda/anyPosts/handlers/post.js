// METHOD	         API     URL
// create	         POST    http://myapi/posts

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require('crypto')

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME

function sanitiseString(str){
    str = str.replace(/[^a-z0-9 !{}():;.,-=+]/gim,"");
    return str.trim();
}

exports.createOne = async (httpPostBody) => {
    console.log("Creating item", httpPostBody, "in table", tableName)
    parsedBody = JSON.parse(httpPostBody)

    const data = await dynamo.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                id: randomUUID(),
                userId: sanitiseString(parsedBody.userId),
                title: sanitiseString(parsedBody.title),
                body: sanitiseString(parsedBody.body)
            },
        })
    );

    body_message = (data.$metadata.httpStatusCode == 200) ? "Success" : "Unsuccessful"

    return {
        statusCode: data.$metadata.httpStatusCode,
        body: {"message": body_message}
    };
};
