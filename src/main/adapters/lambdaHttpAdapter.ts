import { lambdaBodyParser } from '../utils/lambdaBodyParser';

import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyResultV2,
} from 'aws-lambda';

export function lambdaHttpAdapter(controller: any) {
	return async (
		event: APIGatewayProxyEventV2,
	): Promise<APIGatewayProxyResultV2> => {
		const body = lambdaBodyParser(event.body);
		const params = event.pathParameters ?? {};
		const queryParams = event.queryStringParameters ?? {};

		const response = await controller.handle({
			body,
			params,
			queryParams,
		});

		return {
			statusCode: response.statusCode,
			body:
				response.body !== undefined ? JSON.stringify(response.body) : undefined,
		};
	};
}
