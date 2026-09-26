import { lambdaBodyParser } from '../utils/lambdaBodyParser';
import { lambdaErrorResponse } from '../utils/lambdaErrorResponse';

import { ApplicationError } from '@application/errors/application/ApplicationError';
import { HttpError } from '@application/errors/http/HttpError';
import { ZodError } from 'zod';

import type { Controller } from '@application/contracts/Controller';
import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyEventV2WithJWTAuthorizer,
	APIGatewayProxyResultV2,
} from 'aws-lambda';

import { ERROR_CODE } from '@application/errors/ErrorCode';

type Event = APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer;

export function lambdaHttpAdapter(controller: Controller<any, unknown>) {
	return async (event: Event): Promise<APIGatewayProxyResultV2> => {
		try {
			const body = lambdaBodyParser(event.body);
			const params = event.pathParameters ?? {};
			const queryParams = event.queryStringParameters ?? {};
			const accountId =
				'authorizer' in event.requestContext
					? (event.requestContext.authorizer.jwt.claims.internalId as string)
					: null;

			const response = await controller.execute({
				body,
				params,
				queryParams,
				accountId,
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

			if (error instanceof ApplicationError) {
				return lambdaErrorResponse({
					statusCode: error.statusCode ?? 400,
					code: error.code,
					message: error.message,
				});
			}

			// oxlint-disable-next-line no-console
			console.log(error);

			return lambdaErrorResponse({
				statusCode: 500,
				code: ERROR_CODE.INTERNAL_SERVER_ERROR,
				message: 'Internal server error.',
			});
		}
	};
}
