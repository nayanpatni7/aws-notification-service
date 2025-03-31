import { handler } from "./handler";
import { SQSEvent, Context, Callback, SQSRecord } from "aws-lambda";

describe("helloHandler Lambda Function", () => {
    const validPayload = {
        "TotalCount": 2,
        "TotalAmount": 2,
        "DirectCreditDetails": [
            {
                "TransactionId": "D00100537784",
                "BatchId": 212749,
                "DateTime": "2020-01-13T14:21:50.553",
                "Bsb": "802-985",
                "AccountNumber": 419001918,
                "AccountName": "Monoova AccountName",
                "TransactionCode": "50",
                "Amount": 1,
                "LodgementRef": "Ref1",
                "RemitterName": "ABC XYZ",
                "NameOfUserSupplyingFile": "M PAYMENTS",
                "NumberOfUserSupplyingFile": "483449",
                "DescriptionOfEntriesOnFile": "PAYMENT TRNSFR",
                "Indicator": "",
                "WithholdingTaxAmount": 0,
                "SourceBsb": "123-123",
                "SourceAccountNumber": "123456789"
            },
            {
                "TransactionId": "D00100537785",
                "BatchId": 212749,
                "DateTime": "2020-01-13T14:30:50.002",
                "Bsb": "802-985",
                "AccountNumber": 419001923,
                "AccountName": "Monoova AccountName2",
                "TransactionCode": "50",
                "Amount": 1,
                "LodgementRef": "Ref2",
                "RemitterName": "STU XYZ",
                "NameOfUserSupplyingFile": "M PAYMENTS",
                "NumberOfUserSupplyingFile": "483449",
                "DescriptionOfEntriesOnFile": "PAYMENT TRNSFR",
                "Indicator": "",
                "WithholdingTaxAmount": 0,
                "SourceBsb": "123-123",
                "SourceAccountNumber": "234123896"
            }
        ]
    };

    const mockSQSEvent = (body: any, headers: any = {}): SQSEvent => ({
        Records: [
            {
                messageId: "12345",
                receiptHandle: "mock-receipt-handle",
                body: JSON.stringify({ headers, body }),
                attributes: {
                    ApproximateReceiveCount: "1",
                    SentTimestamp: "1640995200000",
                    SenderId: "MockSender",
                    ApproximateFirstReceiveTimestamp: "1640995200000",
                },
                messageAttributes: {},
                md5OfBody: "mock-md5",
                eventSource: "aws:sqs",
                eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:mockQueue",
                awsRegion: "us-east-1",
            } as SQSRecord,
        ],
    });

    // Mock AWS Lambda Context and Callback
    const context: Context = {} as Context;
    const callback: Callback = jest.fn();

    /**
     * ✅ Valid Webhook: Should Process Successfully
     */
    it("should process a valid webhook successfully", async () => {
        const event = mockSQSEvent(validPayload, { "verification-signature": "valid-signature" });

        const response = await handler(event, context, callback);

        expect(response).toBeUndefined(); // ✅ Lambda should not return anything
    });


    /**
     * ❌ Missing Signature: Should Return 400
     */
    it("should return 400 if the signature is missing", async () => {
        const event = mockSQSEvent(validPayload);

        const response: any = await handler(event, context, callback);
        console.log("DEBUG RESPONSE (Missing Signature):", response);

        expect(response).toHaveProperty("statusCode", 400);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Missing verification signature");
    });


    /**
     * ❌ Invalid Signature: Should Return 400
     */
    it("should return 400 if the signature is incorrect", async () => {
        const event = mockSQSEvent(validPayload, { "verification-signature-invalid": "invalid-signature" });

        const response: any = await handler(event, context, callback);
        console.log("DEBUG RESPONSE (Invalid Signature):", response);

        expect(response).toHaveProperty("statusCode", 400);
        expect(JSON.parse(response.body)).toHaveProperty("message", "Missing verification signature");
    });

});
