import { PutCommand } from 'your-dynamo-library'; // replace with the actual import

export const putHandler = async (event, tableName) => {
  const requestJSON = JSON.parse(event.body);
  await dynamo.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        id: requestJSON.id,
        price: requestJSON.price,
        name: requestJSON.name,
      },
    })
  );
  return `Put item ${requestJSON.id}`;
};
