# Webhooks Notification Service

This task is not necessarily about judging your experience to build the service, but to provide some insight in your understanding and learning new skills and knowledge, some of which you may have never used or heard of. Feel free to use AI tools but please don’t blindly accept the solution as it is without any sort of understanding.

### **Objective**

Design and implement an **Incoming Webhooks Notification Service** that processes inbound messages from external vendors. Built on **AWS Serverless** architecture, this service will ensure scalability, reliability, and cost efficiency. This assessment evaluates your ability to code and design distributed systems, implement event-driven patterns, and apply best practices in API security, error handling, and monitoring.

---

### **Requirements**

### **Functional Requirements**

1. **Webhook Ingestion**: Expose an HTTPS endpoint for external vendors to send inbound messages. Use one of Monoova’s webhook called **Receive Inbound Direct Credits Webhook** https://api-docs.monoova.com/payments#tag/Webhooks/operation/InboundDirectCreditWebhook as an example to implement incoming payload.
2. **Payload Verification**: Verify incoming webhook validity using the signature verification mechanism as described in one of the https://api-docs.monoova.com/payments#tag/Webhooks/operation/PayToReceivePaymentWebhook for receiving money in a bank account via their `InboundDirectCredit` event.
3. **Payload Transformation**: Transform verified webhook payload into a **Transaction Model (specified below)** for processing.
4. **Event Handling**: Pass the transformed Transaction Model dtat to an EventSource (using one of AWS services) where it can be consumed by Transaction service (implementation of Transaction service is not in scope).
5. **Logging & Monitoring**: Implement effective logging mechanism using best available tools and AWS services. 
6. **Retries & Error Handling**: Handle failed events through retries, don’t need to implement but can document the approach via architectural diagram or some documentation. 
7. **Testing**: Provide unit tests.

---

### **Technical Constraints**

- Must use **AWS Serverless** components.
- Use Infrastructure-as-Code (IaC) either with CloudFormation, CDK, Terraform, or Serverless Framework.
- Follow event-driven architecture best practices.
- Implement using **TypeScript**.

---

### **Example Use Case: Monoova Webhook**

Use Monoova’s ***Inbound Direct Credit Webhook*** as an example payload:

[API Documentation](https://api-docs.monoova.com/payments#tag/Webhooks/operation/InboundDirectCreditWebhook)

Example JSON Payload:

```json
{
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
}
```

---

### **Transaction Model (TypeScript)**

The verified and transformed webhook data should be mapped to the following **Transaction Model.**  Left open to candidate how they would interpret the sample Monoova payload and map to the Transaction model, no strict guidelines are meant for this. Consider that there could be some important data from Monoova that may fit into `metadata`  and `info`  fields.

```tsx
interface Transaction {
  id: string;
  amount: number;
  createdAt: Date;
  externalId?: string;
  from?: string;
  reference: string;
  status: string;
  to?: string;
  type: string;
  updatedAt: Date;
  metadata: Record<string, unknown>;
  info?: Record<string, unknown>;
}
```

---

### **Deliverables**

1. **Code Repository**
    - Provide a GitHub/GitLab repository.
    - Include a  README with documenting design decisions, setup guide, and API usage details.
2. **Architectural Diagram**
    - Create a high-level diagram showing component interactions along with the choice of AWS services to implement some of the functional requirements.
3. **Tests**
    - Deliver comprehensive unit tests for Typescript code.

---

### **Evaluation Criteria**

- **Architecture & Design**: Clear, well-structured, and scalable system.
- **Code Quality**: Clean, maintainable code with thorough documentation.
- **Security Best Practices**: Robust authentication, authorization, and API security. Can give some documentation if not getting enough time to implement (though would be nice to see some implementation if not all)
- **Error Handling & Observability**: Comprehensive logging along with errors. Can provide some documentation on Observability if not implemented even though would be nice to see some of that.
- **Innovation**: Creative solutions within project constraints.

---

### **Bonus Points (if possible)**

- Implement message deduplication for idempotency.
- Some alerts for critical failures (documenting should be enough).
- Handling other event type from Monoova as per the list https://api-docs.monoova.com/payments#tag/Webhooks (some documentation or implementation is fine to demonstrate the understanding)
- How to extend the this service to include other Vendors in future and not just limited only to Monoova (documentation or some architectural diagram should suffice if not code due to time constraints)

---

###