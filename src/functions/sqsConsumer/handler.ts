import { SQSEvent, SQSHandler } from "aws-lambda";
import { verifySignature } from "../../utils/authorization";
import { badRequest, unauthorized, serverError } from "../../utils/response";
import { processWebhookData } from "./processWebhookData";

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  const requestId = event.Records[0].messageId; // ✅ Unique request ID from SQS
  console.log(`✅ [${requestId}] Received SQS message`);

  const startTime = Date.now();
  const record = event.Records[0];

  try {
    const sqsMessage = JSON.parse(record.body);

    const headers = sqsMessage.headers;
    const messageBody = sqsMessage.body;

    console.log(`🔹 [${requestId}] Processing message`);
    console.log(`🔹 [${requestId}] Headers:`, headers);

    // Validate signature
    const signature = headers["verification-signature"];
    if (!signature) {
      console.error(`❌ [${requestId}] Missing verification signature`);
      throw badRequest("Missing verification signature");
    }

    if (!verifySignature(JSON.stringify(messageBody), signature)) {
      console.error(`❌ [${requestId}] Invalid signature`);
      throw unauthorized("Invalid signature");
    }

    console.log(`✅ [${requestId}] Signature verified`);

    // Process webhook data
    await processWebhookData(messageBody);
    console.log(`✅ [${requestId}] Webhook processed successfully`);

    const executionTime = Date.now() - startTime;
    console.log(`🕒 [${requestId}] Execution Time: ${executionTime}ms`);
  } catch (error) {
    console.error(`❌ [${requestId}] Processing error:`, error);

    // ✅ Return the original error response
    if (error.statusCode) {
      return error;
    }

    // ✅ Return 500 for unknown issues
    throw serverError("Processing failed");
  }
};
