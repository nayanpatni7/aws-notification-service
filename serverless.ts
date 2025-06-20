import type { AWS } from "@serverless/typescript";
// import hello from "@functions/hello";

const serverlessConfiguration: AWS = {
  service: "notification-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: "us-east-1",
    memorySize: 256,
    timeout: 15,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      WEBHOOK_QUEUE_URL: { Ref: "WebhookQueue" },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["sqs:SendMessage"],  // ✅ API Gateway → SQS
        Resource: { "Fn::GetAtt": ["WebhookQueue", "Arn"] },
      },
      {
        Effect: "Allow",
        Action: ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"], // ✅ SQS → Lambda
        Resource: { "Fn::GetAtt": ["WebhookQueue", "Arn"] },
      },
      {
        Effect: "Allow",
        Action: ["sqs:SendMessage", "sqs:GetQueueAttributes"], // ✅ Allow Lambda to send failed messages to DLQ
        Resource: { "Fn::GetAtt": ["WebhookDLQMain", "Arn"] },
      },
      {
        Effect: "Allow",
        Action: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ], // ✅ Allow Lambda to write logs to CloudWatch
        Resource: ["arn:aws:logs:*:*:*"],
      },
    ],
  },
  functions: {
    apiGatewayHandler: {  // ✅ API Gateway → SQS
      handler: "src/functions/apiGatewayHandler/handler.handler",
      events: [
        {
          http: {
            path: "webhook",
            method: "post",
            cors: true,
          },
        },
      ],
    },
    sqsConsumer: {  // ✅ SQS → Main processing Lambda
      handler: "src/functions/sqsConsumer/handler.handler",
      events: [
        {
          sqs: {
            arn: { "Fn::GetAtt": ["WebhookQueue", "Arn"] }, // ✅ Triggered by SQS
            batchSize: 1, // ✅ Process one message per Lambda invocation
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      WebhookQueue: {  // ✅ Main SQS Queue for webhook messages
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "webhook-queue",
          RedrivePolicy: {  // ✅ Retry messages 3 times, then send to DLQ
            deadLetterTargetArn: { "Fn::GetAtt": ["WebhookDLQMain", "Arn"] },
            maxReceiveCount: 3,  // ✅ Max retries before moving to DLQ
          },
        },
      },
      WebhookDLQMain: {  // ✅ Dead Letter Queue (DLQ) with max 14-day retention
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "webhook-dlq-main",
          MessageRetentionPeriod: 1209600,
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node18",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
