# Architecture Diagram

### **Webhook Processing Flow**

### **Architecture Diagram Link:** [Revised Architecture](https://drive.google.com/file/d/1mezdJDIqNWqGmlPElZxWObJAv0nC7tzf/view?usp=sharing)

---

## **Updated Webhook Processing Flow**

+------------------------------------------------------------------+
|                    **Serverless Architecture**                   |
|                                                                  |
|   +--------+                                                     |
|   |  User  |                                                     |
|   +--------+                                                     |
|        |                                                         |
|        |  ① Hits the webhook URL (API Gateway Endpoint)         |
|        v                                                         |
|   +------------------+                                           |
|   |  API Gateway    |                                            |
|   +------------------+                                           |
|        |                                                         |
|        |  ② Forwards request to SQS Queue                        |
|        v                                                         |
|   +------------------+                                           |
|   |   Amazon SQS    |                                            |
|   +------------------+                                           |
|        |                                                         |
|        |  ③ Triggers Lambda function for processing             |
|        |     - ✅ Signature verification of incoming event       |
|        |     - ✅ Request-body presence check                    |
|        |     - ✅ Incoming-data validation & error handling      |
|        |     - ✅ Data transformation to Transaction interface   |
|        |          for further processing                         |
|        |     - ✅ Actual processing & execution                  |
|        v                                                         |
|   +------------------+                                           |
|   |   AWS Lambda    |                                            |
|   +------------------+                                           |
|        |                                                         |
|        |  ④ Logs API Calls & Errors in CloudWatch               |
|        v                                                         |
|   +------------------+                                           |
|   |   CloudWatch    |                                            |
|   +------------------+                                           |
|        |                                                         |
|        |  ⑤ Failed events retried (max 3 times)                  |
|        v                                                         |
|   +------------------+                                           |
|   |    SQS Retry    |                                            |
|   +------------------+                                           |
|        |                                                         |
|        |  If all retries fail, event is moved to DLQ             |
|        v                                                         |
|   +------------------+                                           |
|   |  Dead Letter Queue (DLQ)  |                                   |
|   +------------------+                                           |
|        |                                                         |
|        |  ⑥ Manual review for persistent failures                |
|        v                                                         |
|   +------------------+                                           |
|   |   Manual Review  |                                           |
|   +------------------+                                           |
+------------------------------------------------------------------+

This architecture ensures **asynchronous processing** using **SQS** and **Lambda**, providing reliable event handling with automatic retries and logging mechanisms.

---

## **Flow Steps**  

1️⃣ **User sends a webhook request** – API Gateway receives and forwards it to **Amazon SQS**.  

2️⃣ **SQS queues the request** – Ensures decoupling and async processing.  

3️⃣ **SQS triggers Lambda function** – Processes each message:
   - ✅ Verifies request signature for security.  
   - ✅ Ensures request body is present.  
   - ✅ Validates request data and handles errors.  
   - ✅ Transforms request data into a structured format.  
   - ✅ Processes the transformed data.  

4️⃣ **CloudWatch logs execution & errors** – Logs all incoming requests and failures.  

5️⃣ **Retries if Lambda fails** – SQS retries up to **3 times** before sending failed events to **DLQ**.  

6️⃣ **Dead Letter Queue (DLQ) stores failed events** – For debugging and manual review.  

7️⃣ **Manual intervention for persistent failures** – Allows operators to analyze failed messages.

---

## **Key Improvements Over Old Flow**
✅ **Replaced EventBridge with SQS for event-driven processing.**  
✅ **Better failure handling through DLQ and retry policies.**  
✅ **Asynchronous processing using SQS instead of direct Lambda invocation.**  
✅ **CloudWatch logging for full observability.**  

---

### **Note**  
- The **signature verification** logic follows **Monoova’s Webhook Specifications**.  
- Currently, the verification function always returns `true` (bypassed) due to missing API key from Monoova.  
- Once the API key is provided, strict verification will be enforced.  

---

