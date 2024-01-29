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
    console.log("Getting item", id, "from table", tableName)
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

exports.getMany = async (queryStringParameters) => {
    const queryParams = queryStringParameters || {};

    const filter = queryParams.filter ? JSON.parse(queryParams.filter) : null;
    const sort = queryParams.sort ? JSON.parse(queryParams.sort) : null;
    const range = queryParams.range ? JSON.parse(queryParams.range) : null;

    let data;
    let statusCode=200

    console.log("Filter:", filter, "Sort:", sort, "Range:", range, "from table", tableName)

    // Handle range functionality
    if (range && range.length === 2) {
        const [start, end] = range;
        console.log("Found a range query param", range)
        data = "Not Implemented yet"
        statusCode=501
        // filteredData = filteredData.filter(item => item.id >= start && item.id <= end);
    } else {
        dataRaw = await dynamo.send(
            new ScanCommand({ TableName: tableName })
        );
        data = dataRaw.Items;
    }

    if (filter) {
        console.log("Found a filter query param", filter)
        // partial match
        // filteredData = filteredData.filter(item => {
        //   for (const key in filter) {
        //     const filterValue = filter[key].toLowerCase(); // Convert filter value to lowercase for case-insensitive search
        //     if (typeof item[key] === 'string' && !item[key].toLowerCase().includes(filterValue)) {
        //       return false;
        //     }
        //   }
        //   return true;
        // });
    };
        // Exact match
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
        // filteredData.sort((a, b) => {
        // const [sortKey, sortOrder] = sort;
        // const comparison = a[sortKey] > b[sortKey] ? 1 : -1;
        // return sortOrder === 'ASC' ? comparison : -comparison;
        // });
    }


    // const body = await dynamo.send(
    //     new GetCommand({
    //         TableName: tableName,
    //         Key: {
    //             id : Number(id)
    //         },
    //     })
    // );

    return {
        statusCode: statusCode, 
        body: data
    };
};

