import { APIGatewayProxyResult } from "aws-lambda";

export const badRequest = (message: string) => response(400, { code: 400, message });
export const unauthorized = (message: string) => response(401, { code: 401, message });
export const serverError = (message: string) => response(500, { code: 500, message });

export const successResponse = (message: string, data: any) =>
    response(200, { code: 200, message, data });

const response = (statusCode: number, body: object): APIGatewayProxyResult => ({
    statusCode,
    body: JSON.stringify(body),
});
