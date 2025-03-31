# AWS Notification Service

## **Overview**
This repository contains a serverless webhook processing service built using **AWS API Gateway, Lambda, and SQS**. 
It is designed to efficiently handle inbound webhook events with sinature-verification for security, retries, and monitoring.


## **Design Decisions**

1. **Serverless Architecture**: Utilizes AWS Lambda, API Gateway, and SQS to ensure scalability and cost efficiency.
2. **Signature Verification**: Implements a verification mechanism to authenticate incoming webhooks.
3. **Retries & Error Handling**:
   - Messages failing processing are retried **up to 3 times** via SQS.
   - Failed messages are moved to a **Dead Letter Queue (DLQ)** for manual review.
4. **Logging & Monitoring**: Uses **AWS CloudWatch** for logging all webhook requests and errors.
5. **Asynchronous Processing**: Messages are queued via **SQS** before being processed by **Lambda**, ensuring reliability and minimal latency.

---


## **Setup Steps**

### **Prerequisites**
- **AWS CLI** configured with the required IAM permissions.
- **Serverless Framework** installed globally.
- **Node.js v18+** installed.

### **Installation**
```sh
# Clone the repository
git clone https://github.com/nayanpatni7/aws-notification-service.git
cd aws-notification-service

# Install dependencies
npm install
```

### **Deployment**
To deploy the service on AWS:

1. **Install Serverless Framework** (if not already installed)
```sh
npm install -g serverless
```

2. **Configure AWS Credentials (if not set up)**
```sh
serverless config credentials --provider aws --key <AWS_ACCESS_KEY> --secret <AWS_SECRET_KEY>
```

3. **Deploy the service**
```sh
serverless deploy
```

4. **Remove the service (if needed)**
```sh
serverless remove
```

---

## **Architecture & Flow**
1. **User calls the webhook API (POST request).**
2. **API Gateway** receives the request and forwards it to **Amazon SQS**.
3. **SQS triggers a Lambda function** to process each message (with **max 3 retries** if the Lambda fails).
4. **Lambda verifies the signature and processes the payload.**
5. **If the Lambda fails after all retries(Max 3), the message is moved to the DLQ.**

---

## **API Usage**

### **Webhook Endpoint**
- **Method:** `POST`
- **URL:** `https://f8quffszib.execute-api.us-east-1.amazonaws.com/dev/webhook`
- **Headers:**
  - `Content-Type: application/json`
  - `verification-signature: <signature>`
- **Body:** (Example Payload)
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

### **Response Examples**
#### **Success Response**
```json
{
    "code": 200,
    "message": "Webhook received and queued successfully!"
}
```

#### **Error Response (Missing verification-signature)**
```json
{
    "code": 400,
    "message": "Missing verification-signature"
}
```

#### **Error Response (Invalid verification-signature)**
```json
{
    "code": 401,
    "message": "Invalid signature"
}
```

---

## **Monitoring & Debugging**
- **View API Gateway Logs:** AWS CloudWatch → Log Groups → `/aws/api-gateway/{api-name}`
- **View Lambda Logs:** AWS CloudWatch → Log Groups → `/aws/lambda/{lambda-name}`
- **Check SQS DLQ Messages:** AWS SQS Console → Dead Letter Queue

---

## **Testing**
### **Run Unit Tests**
```sh
npm test
```
### **Run Individual Test Files**
```sh
npx jest src/functions/apiGatewayHandler.test.ts --verbose
```


---

## Commands to verify lambda logs

  # For API Gateway Handler:
  aws logs tail /aws/lambda/apiGatewayHandler --follow

  ## For hello function (Main processing function):
  aws logs tail /aws/lambda/hello --follow


  ## Check API Gateway Logs
  aws logs describe-log-groups --log-group-name-prefix /aws/api-gateway/


---

# Feedback & Updates
Please let me know if any changes or updates are required.

