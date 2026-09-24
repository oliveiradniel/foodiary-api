import { lambdaErrorResponse } from '../utils/lambdaErrorResponse';
import { lambdaBodyParser } from '../utils/lambdaBodyParser';

import { ZodError } from 'zod';
import { HttpError } from '../../application/errors/http/HttpError';

import type { Controller } from '../../application/contracts/Controller';
import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyResultV2,
} from 'aws-lambda';

import { ERROR_CODE } from '../../application/errors/ErrorCode';

export function lambdaHttpAdapter(controller: Controller<unknown>) {
	return async (
		event: APIGatewayProxyEventV2,
	): Promise<APIGatewayProxyResultV2> => {
		try {
			const body = lambdaBodyParser(event.body);
			const params = event.pathParameters ?? {};
			const queryParams = event.queryStringParameters ?? {};

			const response = await controller.execute({
				body,
				params,
				queryParams,
			});

			return {
				statusCode: response.statusCode,
				body:
					response.body !== undefined
						? JSON.stringify(response.body)
						: undefined,
			};
		} catch (error) {
			if (error instanceof ZodError) {
				return lambdaErrorResponse({
					statusCode: 400,
					code: ERROR_CODE.VALIDATION,
					message: error.issues.map((issue) => ({
						field: issue.path.join('.'),
						error: issue.message,
					})),
				});
			}

			if (error instanceof HttpError) {
				return lambdaErrorResponse(error);
			}

			return lambdaErrorResponse({
				statusCode: 500,
				code: ERROR_CODE.INTERNAL_SERVER_ERROR,
				message: 'Internal server error.',
			});
		}
	};
}
