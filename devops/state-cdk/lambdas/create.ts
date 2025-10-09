import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "list" });

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";
const SORT_KEY = process.env.SORT_KEY || "";

const db = DynamoDBDocument.from(new DynamoDB());

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;

function appendRandom(value: string, length: number): string {
  for (let i = 0; i < length; i++) {
    value += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return value;
}

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Missing request body",
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

  const message = {
    [PRIMARY_KEY]: page,
    [SORT_KEY]: appendRandom(`${new Date().toJSON()}-`, 5),
    user: item["user"],
    message: item["message"],
  };
  const params = {
    TableName: TABLE_NAME,
    Item: message,
  };

  try {
    logger.info(`Creating: ${JSON.stringify(message)}`);
    await db.put(params);
    return { statusCode: 201, body: "" };
  } catch (dbError) {
    logger.critical(JSON.stringify(dbError));
    return { statusCode: 500, body: "Unexpected error" };
  }
};
