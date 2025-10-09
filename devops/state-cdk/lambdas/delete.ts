import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "list" });

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";
const SORT_KEY = process.env.SORT_KEY || "";

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

  const { page, eventTime } = item;

  if (!page || !eventTime) {
    return {
      statusCode: 400,
      body: `Expecting page and eventTime`,
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: page,
      [SORT_KEY]: eventTime,
    },
  };

  try {
    logger.info(`Deleting: ${JSON.stringify(params)}`);
    await db.delete(params);
    return { statusCode: 200, body: "" };
  } catch (dbError) {
    logger.critical(JSON.stringify(dbError));
    return { statusCode: 500, body: "Unexpected error" };
  }
};
