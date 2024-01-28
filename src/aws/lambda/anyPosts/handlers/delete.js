import { DeleteCommand } from 'your-dynamo-library'; // replace with the actual import

export const deleteMethod = async (event, tableName) => {
  await dynamo.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        id: event.pathParameters.id,
      },
    })
  );
  return `Deleted item ${event.pathParameters.id}`;
};
