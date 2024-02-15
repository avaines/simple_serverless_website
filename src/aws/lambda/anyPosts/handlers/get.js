// METHOD	         API     URL
// getList	         GET     http://myapi/posts?_sort=title&_order=ASC&_start=0&_end=24&title=bar
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

    const filter = queryParams.filter ? JSON.parse(queryParams.filter) : null;
    const sort = queryParams.sort ? JSON.parse(queryParams.sort) : null;
    const range = queryParams.range ? JSON.parse(queryParams.range) : null;

    let data;
    let statusCode=200;

    // console.log("Filter:", filter, "Sort:", sort, "Range:", range, "from table", tableName)
    console.log("Filter:", filter, "Sort:", sort, "from table", tableName)

    // Range disabled with switch to UUIDs
    // Handle range functionality
    // if (range && range.length === 2) {
    //     const keysMap = [];

    //     for (let i = range[0]; i <= range[1]; i++) {
    //         keysMap.push({ id: Number(i) });
    //     }

    //     console.log("Found a range query param", range, keysMap)

    //     dataRaw = await dynamo.send(
    //         new BatchGetCommand({
    //             RequestItems: {
    //                 [tableName]: {
    //                     Keys: keysMap
    //                 }
    //             }
    //         })
    //     );
    //     data = dataRaw.Responses[tableName];

    // } else {
    dataRaw = await dynamo.send(
        new ScanCommand({ TableName: tableName })
    );
    data = dataRaw.Items;
    // }

    if (filter) {
        console.log("Found a filter query param", filter)
        // Partial match
        data = data.filter(item => {
          for (const key in filter) {
            const filterValue = filter[key].toLowerCase(); // Convert filter value to lowercase for case-insensitive search
            if (typeof item[key] === 'string' && !item[key].toLowerCase().includes(filterValue)) {
              return false;
            }
          }
          return true;
        });
    };
        // Exact match, Commented out because I prefer a partial match
        // filteredData = filteredData.filter(item => {
        //   for (const key in filter) {
        //     if (item[key] !== filter[key]) {
        //       return false;
        //     }
        //   }
        //   return true;
        // });


    // Handle sort functionality
    if (sort) {
        console.log("Found a sort query param", sort)
        data.sort((a, b) => {
        const [sortKey, sortOrder] = sort;
        const comparison = a[sortKey] > b[sortKey] ? 1 : -1;
        return sortOrder === 'ASC' ? comparison : -comparison;
        });
    }

    return {
        statusCode: statusCode,
        body: data
    };
};
