import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { badRequest, serverError, successResponse } from "../utils/response";

const sqs = new SQSClient({ region: "us-east-1" });
const QUEUE_URL = process.env.WEBHOOK_QUEUE_URL!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("✅ Webhook received:", event.body);

    // 🔹 Extract & Validate Headers
    const signature = event.headers["verification-signature"];
    if (!signature) {
        return badRequest("Missing verification-signature header");
    }

    // 🔹 Validate the existance of request body
    if (!event.body || event.body.trim() === "") {
        return badRequest("Request body cannot be empty");
    }


    try {
        const requestData = JSON.parse(event.body);

        // Create message for SQS
        const sqsMessage = {
            headers: event.headers,
            body: requestData,
        };

        // Send message to SQS
        const params = {
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(sqsMessage),
        };

        await sqs.send(new SendMessageCommand(params));
        console.log("✅ Message sent to SQS:", params);

        return successResponse("Webhook received and queued successfully", null);
    } catch (error) {
        console.error("❌ Error sending message to SQS:", error);
        return serverError("Internal Server Error");
    }
};
