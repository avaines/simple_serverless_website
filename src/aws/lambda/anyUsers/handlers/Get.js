// METHOD	         API     URL
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&title=bar
// getOne	         GET     http://myapi/posts/UUID
// getMany	         GET     http://myapi/posts?id=UUID&id=UUID&id=UUID
// getManyReference	 GET     http://myapi/posts?author_id=345

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, BatchGetCommand, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME

exports.getOne = async (id) => {
    console.log("Getting item", id, "from table", tableName)
    const data = await dynamo.send(
        new GetCommand({
            TableName: tableName,
            Key: {
                id : id
            },
        })
    );

    return {
        statusCode: 200,
        body: data.Item
    };
};

// No searching for users in the example, see Posts
exports.getMany = async (queryStringParameters) => {
    const queryParams = queryStringParameters || {};

    const sortKey = queryParams._sort || null;
    const sortOrder = queryParams._order || null;

    let data;
    let statusCode=200;

    console.log("Sort:", sortKey, "Order:", sortOrder)

    let dataRaw = await dynamo.send(
        new ScanCommand({ TableName: tableName })
    );

    data = dataRaw.Items;

    if (sortKey != null) {
        data.sort((a, b) => {
            const comparison = a[sortKey] > b[sortKey] ? 1 : -1;
            return sortOrder === "ASC" ? comparison : -comparison;
        });
    }

    return {
        statusCode: statusCode,
        body: data
    };
};
