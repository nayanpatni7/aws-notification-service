import { badRequest, successResponse } from "../../utils/response";
import { Transaction } from "./transactionSchema";

// ✅ Check & Parse the incoming payload
const checkAndParseIncomingData = (data: any) => {
    console.log("🗄 Checking & parsing payload...");

    let parsedPayload;
    if (typeof data === "string") {
        try {
            parsedPayload = JSON.parse(data);
        } catch (error) {
            throw badRequest("Invalid JSON body");
        }
    } else {
        parsedPayload = data;
    }

    console.log("✅ Parsed payload:", parsedPayload);
    return parsedPayload;
};

// ✅ Validate required fields in the payload
const validateIncomingTransactionData = (payload: any) => {
    if (!payload.DirectCreditDetails || !Array.isArray(payload.DirectCreditDetails) || payload.DirectCreditDetails.length === 0) {
        throw badRequest("Missing or invalid DirectCreditDetails array");
    }

    for (const detail of payload.DirectCreditDetails) {
        if (!detail.TransactionId || !detail.Amount || !detail.DateTime || !detail.LodgementRef) {
            throw badRequest("Missing required fields in DirectCreditDetails item");
        }

        if (!detail.AccountNumber || !detail.AccountName) {
            throw badRequest("Missing required fields in DirectCreditDetails item: AccountNumber or AccountName");
        }
    }

    return true;
};

// ✅ Transform and Process Data
const transformAndProcessData = (parsed: any): Transaction[] => {
    try {
        if (!parsed.DirectCreditDetails || !Array.isArray(parsed.DirectCreditDetails)) {
            console.warn("⚠️ DirectCreditDetails is missing or not an array.");
            return [];
        }

        const transactions: Transaction[] = parsed.DirectCreditDetails.map((detail: any) => ({
            id: detail.TransactionId,
            amount: detail.Amount,
            createdAt: new Date(detail.DateTime),
            externalId: String(detail.BatchId),
            from: detail.SourceAccountNumber,
            reference: detail.LodgementRef,
            status: "Completed",
            to: String(detail.AccountNumber),
            type: "InboundDirectCredit",
            updatedAt: new Date(),
            metadata: {
                Bsb: detail.Bsb,
                AccountName: detail.AccountName,
                TransactionCode: detail.TransactionCode,
                RemitterName: detail.RemitterName,
                NameOfUserSupplyingFile: detail.NameOfUserSupplyingFile,
                NumberOfUserSupplyingFile: detail.NumberOfUserSupplyingFile,
                DescriptionOfEntriesOnFile: detail.DescriptionOfEntriesOnFile,
                Indicator: detail.Indicator,
                WithholdingTaxAmount: detail.WithholdingTaxAmount,
                SourceBsb: detail.SourceBsb,
            },
            info: {
                rawDetail: detail,
            },
        }));

        console.log("✅ Transformed transactions:", transactions);
        return transactions;
    } catch (error) {
        console.error("❌ Error transforming payload:", error);
        return [];
    }
};


// ✅ Main function
export const processWebhookData = async (data: any) => {
    const parsedPayload = checkAndParseIncomingData(data);
    console.log("✅ Payload conversion complete");

    validateIncomingTransactionData(parsedPayload);
    console.log("✅ Incoming data validation successful");

    const transformedData = transformAndProcessData(parsedPayload);
    console.log("✅ Payload transformation & procssing complete");

    return successResponse("Trigger/event received at webhook & processed successfully!", transformedData);
};