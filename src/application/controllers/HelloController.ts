import type { HttpRequest } from '../contracts/HttpRequest';
import type { HttpResponse } from '../contracts/HttpResponse';

export class HelloController {
	async handle(request: HttpRequest): Promise<HttpResponse<unknown>> {
		return {
			statusCode: 200,
			body: { request },
		};
	}
}
