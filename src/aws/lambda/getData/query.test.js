const { handler } = require('./query');

const mockDynamoDB = {
  get: jest.fn(),
};

jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => mockDynamoDB),
  },
}));

describe('Query Lambda Function', () => {
  it('should return data when item is found in DynamoDB', async () => {
    const event = {};
    const context = {};
    const expectedItem = {
      id: 'some-unique-id', // Replace with the primary key of your item
      otherProperty: 'someValue',
    };

    mockDynamoDB.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({ Item: expectedItem }),
    });

    const response = await handler(event, context);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(expectedItem);
  });

  it('should return a 404 status code when item is not found in DynamoDB', async () => {
    const event = {};
    const context = {};

    mockDynamoDB.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({}),
    });

    const response = await handler(event, context);

    expect(response.statusCode).toBe(404);
  });

  it('should return a 500 status code on error', async () => {
    const event = {};
    const context = {};

    mockDynamoDB.get.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
    });

    const response = await handler(event, context);

    expect(response.statusCode).toBe(500);
  });
});
