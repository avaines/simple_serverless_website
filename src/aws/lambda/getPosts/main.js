// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

const sampleData = require('./example-data.json');


exports.handler = async (event) => {
  // Get query parameters from the request
  console.log(event)

  const queryParams = event.queryStringParameters || {};

  const filter = queryParams.filter ? JSON.parse(queryParams.filter) : null;
  const sort = queryParams.sort ? JSON.parse(queryParams.sort) : null;
  const range = queryParams.range ? JSON.parse(queryParams.range) : null;

  // Handle filter functionality
  let filteredData = [...sampleData];

  if (filter) {
    console.log("Found a filter query param", filter)
    // partial match
    filteredData = filteredData.filter(item => {
      for (const key in filter) {
        const filterValue = filter[key].toLowerCase(); // Convert filter value to lowercase for case-insensitive search
        if (typeof item[key] === 'string' && !item[key].toLowerCase().includes(filterValue)) {
          return false;
        }
      }
      return true;
    });

    // Exact match
    // filteredData = filteredData.filter(item => {
    //   for (const key in filter) {
    //     if (item[key] !== filter[key]) {
    //       return false;
    //     }
    //   }
    //   return true;
    // });
  }

  // Handle range functionality
  if (range && range.length === 2) {
    console.log("Found a range query param", range)
    const [start, end] = range;
    filteredData = filteredData.filter(item => item.id >= start && item.id <= end);
  }

  // Handle sort functionality
  if (sort) {
    console.log("Found a sort query param", sort)
    filteredData.sort((a, b) => {
      const [sortKey, sortOrder] = sort;
      const comparison = a[sortKey] > b[sortKey] ? 1 : -1;
      return sortOrder === 'ASC' ? comparison : -comparison;
    });
  }

  // If 'id' is provided in path parameter, return specific item
  const postId = event.pathParameters ? event.pathParameters.id : null;
  if (postId) {
    console.log("Found a post ID path", postId)
    const post = filteredData.find(item => item.id === parseInt(postId));
    if (!post) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Post not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.parse(post)
    };
  }

  // Return filtered/sorted/ranged data
  return {
    statusCode: 200,
    body: JSON.parse(filteredData)
  };
};



// exports.handler = async (event, context) => {
//   try {
//     // Retrieve data from DynamoDB table
//     // const params = {
//     //   TableName: process.env.DYNAMODB_TABLE,
//     //   Key: {
//     //     id: 'some-unique-id', // Replace with your item's primary key
//     //   },
//     // };

//     // const data = await dynamoDB.get(params).promise();
//     const data = {"Item":["Some test data", "Some more test data"]}

//     if (!data.Item) {
//       return {
//         statusCode: 404,
//         body: JSON.stringify({ message: 'Item not found' }),
//       };
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify(data.Item),
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Internal server error' }),
//     };
//   }
// };
