import { processWebhookData } from "./processWebhookData";
import * as responseUtils from "../../utils/response";

describe("processWebhookData", () => {
    const mockSuccessResponse = jest.spyOn(responseUtils, "successResponse");
    const mockBadRequest = jest.spyOn(responseUtils, "badRequest");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validPayload = {
        DirectCreditDetails: [
            {
                TransactionId: "txn-123",
                Amount: 1000,
                DateTime: "2025-06-19T12:00:00Z",
                LodgementRef: "INV123",
                AccountNumber: "123456789",
                AccountName: "John Doe",
                BatchId: "batch-001",
                SourceAccountNumber: "999888777",
                Bsb: "123-456",
                TransactionCode: "50",
                RemitterName: "Jane",
                NameOfUserSupplyingFile: "CorpX",
                NumberOfUserSupplyingFile: "1111",
                DescriptionOfEntriesOnFile: "Salary",
                Indicator: "N",
                WithholdingTaxAmount: "0.00",
                SourceBsb: "000-111",
            },
        ],
    };

    it("should handle stringified JSON payload", async () => {
        mockSuccessResponse.mockImplementation((msg, data) => ({
            statusCode: 200,
            body: JSON.stringify({ message: msg, data }),
        }));

        const result = await processWebhookData(JSON.stringify(validPayload));
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(200);
        expect(body.message).toBe("Trigger/event received at webhook & processed successfully!");
        expect(body.data[0].id).toBe("txn-123");
    });


    it("should handle already-parsed object payload", async () => {
        mockSuccessResponse.mockImplementation((msg, data) => ({
            statusCode: 200,
            body: JSON.stringify({ message: msg, data }),
        }));

        const result = await processWebhookData(validPayload);
        const body = JSON.parse(result.body);

        expect(body.data[0].amount).toBe(1000);
        expect(body.data[0].metadata.AccountName).toBe("John Doe");
    });


    it("should throw badRequest error on invalid JSON string", async () => {
        mockBadRequest.mockImplementation((msg) => {
            throw new Error(msg);
        });

        await expect(processWebhookData("{ invalid json")).rejects.toThrow("Invalid JSON body");
    });


    it("should throw error for missing DirectCreditDetails", async () => {
        mockBadRequest.mockImplementation((msg) => {
            throw new Error(msg);
        });

        const invalid = {};
        await expect(processWebhookData(invalid)).rejects.toThrow("Missing or invalid DirectCreditDetails array");
    });


    it("should throw error for incomplete detail object", async () => {
        mockBadRequest.mockImplementation((msg) => {
            throw new Error(msg);
        });

        const invalid = {
            DirectCreditDetails: [
                {
                    Amount: 1000,
                    LodgementRef: "INV001",
                    DateTime: "2025-06-19T12:00:00Z",
                    // Missing TransactionId and AccountName
                },
            ],
        };

        await expect(processWebhookData(invalid)).rejects.toThrow("Missing required fields in DirectCreditDetails item");
    });


    it("should throw error if DirectCreditDetails is not an array", async () => {
        mockBadRequest.mockImplementation((msg) => {
            throw new Error(msg);
        });

        const malformed = { DirectCreditDetails: "not-an-array" };

        await expect(processWebhookData(malformed)).rejects.toThrow("Missing or invalid DirectCreditDetails array");
    });

});
