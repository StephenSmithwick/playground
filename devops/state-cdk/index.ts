import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { App, Stack, CfnOutput } from "aws-cdk-lib";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";

export class LambdaCommentsStack extends Stack {
  constructor(app: App, id: string, durable: DurableStack) {
    super(app, id);

    const dynamoTable = durable.table;

    Object.entries({
      createMessageFunction: { file: "create.ts", limit: 1 },
      listMessagesFunction: { file: "list.ts", limit: 2 },
      updateMessageFunction: { file: "update.ts", limit: 1 },
      deleteMessageFunction: { file: "delete.ts", limit: 1 },
    }).forEach(([name, props]) =>
      createFunction(this, dynamoTable, name, props.file, props.limit),
    );
  }
}

export class DurableStack extends Stack {
  table: Table;

  constructor(app: App, id: string) {
    super(app, id);

    this.table = new Table(this, "Comments", {
      partitionKey: {
        name: "page",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "eventTime",
        type: AttributeType.STRING,
      },
    });
  }
}

function createFunction(
  stack: Stack,
  dynamoTable: Table,
  functionName: string,
  file: string,
  reservedConcurrentExecutions: number,
) {
  const nodeJsFunctionProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ["aws-sdk"],
    },
    depsLockFilePath: join(__dirname, "lambdas", "package-lock.json"),
    environment: {
      PRIMARY_KEY: "page",
      SORT_KEY: "eventTime",
      TABLE_NAME: dynamoTable.tableName,
    },
    runtime: lambda.Runtime.NODEJS_20_X,
    reservedConcurrentExecutions,
  };

  // Create a Lambda function
  const lambdaFunction = new NodejsFunction(stack, functionName, {
    entry: join(__dirname, "lambdas", file),
    ...nodeJsFunctionProps,
  });

  // Grant access to Dynamo Table
  dynamoTable.grantReadWriteData(lambdaFunction);

  // Setup lambda url
  const lambdaUrl = lambdaFunction.addFunctionUrl({
    authType: lambda.FunctionUrlAuthType.NONE,
    cors: {
      allowedOrigins: ["https://stephensmithwick.github.io"],
      allowedHeaders: ["content-type"],
    },
  });

  new CfnOutput(stack, `${functionName}.url`, { value: lambdaUrl.url });
}

const app = new App();

const durable = new DurableStack(app, "CommentsStore");
new LambdaCommentsStack(app, "CommentsInterface", durable);

app.synth();
