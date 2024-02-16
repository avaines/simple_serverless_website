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

exports.getMany = async (queryStringParameters) => {
    const queryParams = queryStringParameters || {};

    const sortKey = queryParams._sort || null;
    const sortOrder = queryParams._order || null;
    const search = queryParams.search || null;      // Unspecified field, eg a Search
    const filters = {
      "userId": queryParams.userId || null,         // Specific match fields, eg a ReferenceInput
    }

    let data;
    let statusCode=200;

    console.log("Filter:", filters, "Sort:", sortKey, "Order:", sortOrder)

    let dataRaw = await dynamo.send(
        new ScanCommand({ TableName: tableName })
    );

    data = dataRaw.Items;

    // Check if any speific filter options are provided, by ensuring the list of known ones isn't just full of null values
    if (Object.values(filters).some(value => value !== null)) {
        data = data.filter(item => {
          for (const key in filters) {
            if (filters[key] !== null && item[key] === filters[key]) {
              return true;
            }
          }
          return false;
        });
    };

    if (search != null) {
        data = data.filter(item => {
            return Object.values(item).some(value => {
              if (typeof value === 'string') {
                return value.includes(search);
              }
              return false;
            });
        });
    };

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
