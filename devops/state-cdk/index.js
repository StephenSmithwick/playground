"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurableStack = exports.LambdaCommentsStack = void 0;
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path_1 = require("path");
class LambdaCommentsStack extends aws_cdk_lib_1.Stack {
    constructor(app, id, durable) {
        super(app, id);
        const dynamoTable = durable.table;
        Object.entries({
            createMessageFunction: { file: "create.ts", limit: 1 },
            listMessagesFunction: { file: "list.ts", limit: 2 },
            updateMessageFunction: { file: "update.ts", limit: 1 },
            deleteMessageFunction: { file: "delete.ts", limit: 1 },
        }).forEach(([name, props]) => createFunction(this, dynamoTable, name, props.file, props.limit));
    }
}
exports.LambdaCommentsStack = LambdaCommentsStack;
class DurableStack extends aws_cdk_lib_1.Stack {
    constructor(app, id) {
        super(app, id);
        this.table = new aws_dynamodb_1.Table(this, "Comments", {
            partitionKey: {
                name: "page",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            sortKey: {
                name: "eventTime",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
        });
    }
}
exports.DurableStack = DurableStack;
function createFunction(stack, dynamoTable, functionName, file, reservedConcurrentExecutions) {
    const nodeJsFunctionProps = {
        bundling: {
            externalModules: ["aws-sdk"],
        },
        depsLockFilePath: (0, path_1.join)(__dirname, "lambdas", "package-lock.json"),
        environment: {
            PRIMARY_KEY: "page",
            SORT_KEY: "eventTime",
            TABLE_NAME: dynamoTable.tableName,
        },
        runtime: lambda.Runtime.NODEJS_20_X,
        reservedConcurrentExecutions,
    };
    // Create a Lambda function
    const lambdaFunction = new aws_lambda_nodejs_1.NodejsFunction(stack, functionName, {
        entry: (0, path_1.join)(__dirname, "lambdas", file),
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
    new aws_cdk_lib_1.CfnOutput(stack, `${functionName}.url`, { value: lambdaUrl.url });
}
const app = new aws_cdk_lib_1.App();
const durable = new DurableStack(app, "CommentsStore");
new LambdaCommentsStack(app, "CommentsInterface", durable);
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyREFBZ0U7QUFDaEUsaURBQWlEO0FBQ2pELDZDQUFvRDtBQUNwRCxxRUFHdUM7QUFDdkMsK0JBQTRCO0FBRTVCLE1BQWEsbUJBQW9CLFNBQVEsbUJBQUs7SUFDNUMsWUFBWSxHQUFRLEVBQUUsRUFBVSxFQUFFLE9BQXFCO1FBQ3JELEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFZixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBRWxDLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDYixxQkFBcUIsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtZQUN0RCxvQkFBb0IsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtZQUNuRCxxQkFBcUIsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtZQUN0RCxxQkFBcUIsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtTQUN2RCxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUMzQixjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQ2pFLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFmRCxrREFlQztBQUVELE1BQWEsWUFBYSxTQUFRLG1CQUFLO0lBR3JDLFlBQVksR0FBUSxFQUFFLEVBQVU7UUFDOUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVmLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDdkMsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU07YUFDM0I7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU07YUFDM0I7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFqQkQsb0NBaUJDO0FBRUQsU0FBUyxjQUFjLENBQ3JCLEtBQVksRUFDWixXQUFrQixFQUNsQixZQUFvQixFQUNwQixJQUFZLEVBQ1osNEJBQW9DO0lBRXBDLE1BQU0sbUJBQW1CLEdBQXdCO1FBQy9DLFFBQVEsRUFBRTtZQUNSLGVBQWUsRUFBRSxDQUFDLFNBQVMsQ0FBQztTQUM3QjtRQUNELGdCQUFnQixFQUFFLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUM7UUFDakUsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFLE1BQU07WUFDbkIsUUFBUSxFQUFFLFdBQVc7WUFDckIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxTQUFTO1NBQ2xDO1FBQ0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztRQUNuQyw0QkFBNEI7S0FDN0IsQ0FBQztJQUVGLDJCQUEyQjtJQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLGtDQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRTtRQUM3RCxLQUFLLEVBQUUsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUM7UUFDdkMsR0FBRyxtQkFBbUI7S0FDdkIsQ0FBQyxDQUFDO0lBRUgsK0JBQStCO0lBQy9CLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUUvQyxtQkFBbUI7SUFDbkIsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQztRQUM5QyxRQUFRLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUk7UUFDekMsSUFBSSxFQUFFO1lBQ0osY0FBYyxFQUFFLENBQUMsb0NBQW9DLENBQUM7WUFDdEQsY0FBYyxFQUFFLENBQUMsY0FBYyxDQUFDO1NBQ2pDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBSSx1QkFBUyxDQUFDLEtBQUssRUFBRSxHQUFHLFlBQVksTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3hFLENBQUM7QUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQztBQUV0QixNQUFNLE9BQU8sR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDdkQsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFM0QsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlVHlwZSwgVGFibGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcbmltcG9ydCB7IEFwcCwgU3RhY2ssIENmbk91dHB1dCB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHtcbiAgTm9kZWpzRnVuY3Rpb24sXG4gIE5vZGVqc0Z1bmN0aW9uUHJvcHMsXG59IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjbGFzcyBMYW1iZGFDb21tZW50c1N0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaWQ6IHN0cmluZywgZHVyYWJsZTogRHVyYWJsZVN0YWNrKSB7XG4gICAgc3VwZXIoYXBwLCBpZCk7XG5cbiAgICBjb25zdCBkeW5hbW9UYWJsZSA9IGR1cmFibGUudGFibGU7XG5cbiAgICBPYmplY3QuZW50cmllcyh7XG4gICAgICBjcmVhdGVNZXNzYWdlRnVuY3Rpb246IHsgZmlsZTogXCJjcmVhdGUudHNcIiwgbGltaXQ6IDEgfSxcbiAgICAgIGxpc3RNZXNzYWdlc0Z1bmN0aW9uOiB7IGZpbGU6IFwibGlzdC50c1wiLCBsaW1pdDogMiB9LFxuICAgICAgdXBkYXRlTWVzc2FnZUZ1bmN0aW9uOiB7IGZpbGU6IFwidXBkYXRlLnRzXCIsIGxpbWl0OiAxIH0sXG4gICAgICBkZWxldGVNZXNzYWdlRnVuY3Rpb246IHsgZmlsZTogXCJkZWxldGUudHNcIiwgbGltaXQ6IDEgfSxcbiAgICB9KS5mb3JFYWNoKChbbmFtZSwgcHJvcHNdKSA9PlxuICAgICAgY3JlYXRlRnVuY3Rpb24odGhpcywgZHluYW1vVGFibGUsIG5hbWUsIHByb3BzLmZpbGUsIHByb3BzLmxpbWl0KSxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXJhYmxlU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIHRhYmxlOiBUYWJsZTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCwgaWQpO1xuXG4gICAgdGhpcy50YWJsZSA9IG5ldyBUYWJsZSh0aGlzLCBcIkNvbW1lbnRzXCIsIHtcbiAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICBuYW1lOiBcInBhZ2VcIixcbiAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgICAgc29ydEtleToge1xuICAgICAgICBuYW1lOiBcImV2ZW50VGltZVwiLFxuICAgICAgICB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb24oXG4gIHN0YWNrOiBTdGFjayxcbiAgZHluYW1vVGFibGU6IFRhYmxlLFxuICBmdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgZmlsZTogc3RyaW5nLFxuICByZXNlcnZlZENvbmN1cnJlbnRFeGVjdXRpb25zOiBudW1iZXIsXG4pIHtcbiAgY29uc3Qgbm9kZUpzRnVuY3Rpb25Qcm9wczogTm9kZWpzRnVuY3Rpb25Qcm9wcyA9IHtcbiAgICBidW5kbGluZzoge1xuICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXCJhd3Mtc2RrXCJdLFxuICAgIH0sXG4gICAgZGVwc0xvY2tGaWxlUGF0aDogam9pbihfX2Rpcm5hbWUsIFwibGFtYmRhc1wiLCBcInBhY2thZ2UtbG9jay5qc29uXCIpLFxuICAgIGVudmlyb25tZW50OiB7XG4gICAgICBQUklNQVJZX0tFWTogXCJwYWdlXCIsXG4gICAgICBTT1JUX0tFWTogXCJldmVudFRpbWVcIixcbiAgICAgIFRBQkxFX05BTUU6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZSxcbiAgICB9LFxuICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgIHJlc2VydmVkQ29uY3VycmVudEV4ZWN1dGlvbnMsXG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgTGFtYmRhIGZ1bmN0aW9uXG4gIGNvbnN0IGxhbWJkYUZ1bmN0aW9uID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHN0YWNrLCBmdW5jdGlvbk5hbWUsIHtcbiAgICBlbnRyeTogam9pbihfX2Rpcm5hbWUsIFwibGFtYmRhc1wiLCBmaWxlKSxcbiAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuICB9KTtcblxuICAvLyBHcmFudCBhY2Nlc3MgdG8gRHluYW1vIFRhYmxlXG4gIGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShsYW1iZGFGdW5jdGlvbik7XG5cbiAgLy8gU2V0dXAgbGFtYmRhIHVybFxuICBjb25zdCBsYW1iZGFVcmwgPSBsYW1iZGFGdW5jdGlvbi5hZGRGdW5jdGlvblVybCh7XG4gICAgYXV0aFR5cGU6IGxhbWJkYS5GdW5jdGlvblVybEF1dGhUeXBlLk5PTkUsXG4gICAgY29yczoge1xuICAgICAgYWxsb3dlZE9yaWdpbnM6IFtcImh0dHBzOi8vc3RlcGhlbnNtaXRod2ljay5naXRodWIuaW9cIl0sXG4gICAgICBhbGxvd2VkSGVhZGVyczogW1wiY29udGVudC10eXBlXCJdLFxuICAgIH0sXG4gIH0pO1xuXG4gIG5ldyBDZm5PdXRwdXQoc3RhY2ssIGAke2Z1bmN0aW9uTmFtZX0udXJsYCwgeyB2YWx1ZTogbGFtYmRhVXJsLnVybCB9KTtcbn1cblxuY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuXG5jb25zdCBkdXJhYmxlID0gbmV3IER1cmFibGVTdGFjayhhcHAsIFwiQ29tbWVudHNTdG9yZVwiKTtcbm5ldyBMYW1iZGFDb21tZW50c1N0YWNrKGFwcCwgXCJDb21tZW50c0ludGVyZmFjZVwiLCBkdXJhYmxlKTtcblxuYXBwLnN5bnRoKCk7XG4iXX0=