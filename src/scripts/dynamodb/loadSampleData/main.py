'''
loadSampleData
A script to load sample data into a given DynamoDB table with the option to empty it first

Arguments
    # --data-path --table-name --empty-first

    -d or --data-path     The path to a JSON file detailing the data to import in to the table
    -t or --table-name    The name of a DynamoDB table
    --empty-first       If set the table will be emptied before running the import

Example:
    python loadSampleData/main.py [-d]--data-path [-t]--table-name mytable --empty-first
'''

import argparse
import json
import boto3


class DynamoDbTable:
    # pylint: disable=R0903, too-few-public-methods
    'Simple class for managing the dynamodb table in question'

    def __init__(self, table_name):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(table_name)


    def empty_table(self):
        'Empty table by scanning for all items then looping through them, its a bit lazy'
        response = self.table.scan()
        print(f"\t {response['Count']} items found in the {self.table.name} table")

        try:
            with self.table.batch_writer() as batch:
                print(f"\t Deleting {len(response['Items'])} items in {self.table.name}: ", end='')
                for i, item in enumerate(response['Items']):
                    batch.delete_item(
                        Key={
                            'id': item['id']
                        }
                    )
                    print(f"{round((i+1) / len(response['Items'])*100)}%", end=' ')

            print(f"\n\t All items deleted from the table: {self.table.name}")

        except ImportError:
            print(f"\t Something went wrong when emptying the {self.table.name} table.")


    def import_json_data(self, data_path):
        'Import a JSON file into the target dynamodb table'
        with open(data_path, 'r', encoding="utf8") as file:
            data = json.load(file)

        # Insert items into the table
        with self.table.batch_writer() as batch:
            for i, item in enumerate(data):
                batch.put_item(Item=item)
                print(f"{round((i+1) / len(data)*100)}%", end=' ')

        print(f"\n\t {len(data)} items imported into the {self.table.name} table")



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--data-path', dest='path', help="The path to a JSON file detailing the data to import in to the table", required=True)
    parser.add_argument('-t', '--table', help="The name of a DynamoDB table", dest='table', required=True)
    parser.add_argument('--empty-first', dest="empty_first", help="If set the table will be emptied before running the import", action='store_true')
    args = parser.parse_args()

    dynamodb_table = DynamoDbTable((args.table))

    if args.empty_first:
        print(f"Destroying all data in the {args.table} table.")
        dynamodb_table.empty_table()

    dynamodb_table.import_json_data(args.path)
