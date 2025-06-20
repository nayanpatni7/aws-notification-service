import { handler } from "./handler";
import { APIGatewayProxyEvent } from "aws-lambda";

jest.mock("@aws-sdk/client-sqs", () => {
    return {
        SQSClient: jest.fn().mockImplementation(() => ({
            send: jest.fn().mockRejectedValue(new Error("SQS failure")), // ✅ Simulate SQS failure
        })),
        SendMessageCommand: jest.fn(),
    };
});

describe("apiGatewayHandler Lambda Function", () => {
    const mockAPIGatewayEvent = (body: any, headers: any = {}): APIGatewayProxyEvent => ({
        body: body ? JSON.stringify(body) : null,
        headers,
        httpMethod: "POST",
        isBase64Encoded: false,
        multiValueHeaders: {},
        path: "/webhook",
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        requestContext: {} as any,
        resource: "",
        stageVariables: null,
    });

    /**
     * ✅ Valid Webhook: Should Send Message to SQS
     */
    it("should accept a valid request and send it to SQS", async () => {
        const event = mockAPIGatewayEvent({ test: "valid-data" }, { "verification-signature": "valid-signature" });

        const response = await handler(event);
        console.log("DEBUG RESPONSE (Valid Request):", response);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Webhook received and queued successfully");
    });

    /**
     * ❌ Missing Headers: Should Return 400
     */
    it("should return 400 if the verification-signature header is missing", async () => {
        const event = mockAPIGatewayEvent({ test: "valid-data" });

        const response = await handler(event);
        console.log("DEBUG RESPONSE (Missing Headers):", response);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Missing verification-signature header");
    });

    /**
     * ❌ Missing Body: Should Return 400
     */
    it("should return 400 if the request body is missing", async () => {
        const event = mockAPIGatewayEvent(null, { "verification-signature": "valid-signature" });

        const response = await handler(event);
        console.log("DEBUG RESPONSE (Missing Body):", response);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Request body cannot be empty");
    });

    /**
     * ❌ Invalid Signature: Should Return 401
     */
    it("should return 401 if the verification signature is invalid", async () => {
        const event = mockAPIGatewayEvent({ test: "valid-data" }, { "verification-signature-invalid": "invalid-signature" });

        const response = await handler(event);
        console.log("DEBUG RESPONSE (Invalid Signature):", response);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Invalid signature");
    });

    /**
     * ❌ SQS Failure: Should Return 500
     */
    it("should return 500 if SQS fails to process the message", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress error logs in tests

        const event = mockAPIGatewayEvent({ test: "valid-data" }, { "verification-signature": "valid-signature" });

        const response = await handler(event);
        console.log("DEBUG RESPONSE (SQS Failure):", response);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Internal Server Error");
    });

});
