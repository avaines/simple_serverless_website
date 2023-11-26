// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    // Retrieve data from DynamoDB table
    // const params = {
    //   TableName: process.env.DYNAMODB_TABLE,
    //   Key: {
    //     id: 'some-unique-id', // Replace with your item's primary key
    //   },
    // };

    // const data = await dynamoDB.get(params).promise();
    const data = {"Item":["Some test data", "Some more test data"]}

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
