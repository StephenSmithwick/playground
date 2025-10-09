import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "list" });

const TABLE_NAME = process.env.TABLE_NAME || "";

const db = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Missing request body.",
    };
  }
  const item =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);

  const { page } = item;

  if (!page) {
    return {
      statusCode: 400,
      body: `Expecting page`,
    };
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "#page = :page",
    ExpressionAttributeNames: {
      "#page": "page",
    },
    ExpressionAttributeValues: {
      ":page": page,
    },
  };

  try {
    const response = await db.query(params);
    return {
      statusCode: 200,
      body: JSON.stringify(
        response.Items.sort((a, b) =>
          a.eventTime > b.eventTime ? 1 : a.eventTime < b.eventTime ? -1 : 0,
        ),
      ),
    };
  } catch (dbError) {
    logger.critical(JSON.stringify(dbError));
    return { statusCode: 500, body: "Unexpected error" };
  }
};
