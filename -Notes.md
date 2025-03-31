# BASIC SETUP INFO


## Step 1: Create folder & get insider
mkdir notification-serrvice
cd notification-service


## Step 2: Initialize Serverless Framework
serverless create --template aws-nodejs-typescript --path .
npm install


## Step 3: Deploy the app
serverless deploy
```sh
➜  notification-service git:(main) ✗ serverless deploy

Running "serverless" from node_modules

Deploying notification-service to stage dev (us-east-1)

✔ Service deployed to stack notification-service-dev (177s)

endpoint: POST - https://mg5dsp15m4.execute-api.us-east-1.amazonaws.com/dev/webhook
functions:
  hello: notification-service-dev-hello (1.8 kB)
```


# Step 4: Deploy the app
serverless deploy


```sh

➜  notification-service git:(main) ✗ serverless deploy

Running "serverless" from node_modules
Deploying notification-service to stage dev (us-east-1)

✔ Service deployed to stack notification-service-dev (310s)

endpoint: POST - https://f8quffszib.execute-api.us-east-1.amazonaws.com/dev/webhook
functions:
  apiGatewayHandler: notification-service-dev-apiGatewayHandler (484 kB)
  hello: notification-service-dev-hello (4.7 kB)

1 deprecation found: run 'serverless doctor' for more details
Monitor all your API routes with Serverless Console: run "serverless --console"
```



# Check logs of specific function
serverless logs -f hello --tail



# Some dummy code

```js
// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
// import { middyfy } from '@libs/lambda';

// import schema from './schema';

// const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
//   return formatJSONResponse({
//     message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
//     event,
//   });
// };

// export const main = middyfy(hello);
```