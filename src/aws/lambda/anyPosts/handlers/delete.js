// METHOD	         API     URL
// delete	         DELETE  http://myapi/posts/123

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME

exports.deleteOne = async (id) => {
    console.log("Deleting item", id, "from table", tableName)

    let data = await dynamo.send(
        new DeleteCommand({
            TableName: tableName,
            Key: {
                id: id
            },
            ReturnValues: 'ALL_OLD',
        })
    );

    if (data.$metadata.httpStatusCode === 200) {
        if (data.Attributes) {
            body_message = `Item ${id} deleted`
        } else {
            body_message = `Item ${id} does not exist`
            data.$metadata.httpStatusCode = 404
        }
    } else {
        body_message = `Failed deleting item ${id}`
    }

    return {
        statusCode: data.$metadata.httpStatusCode,
        body: {"message": body_message}
    };
};
