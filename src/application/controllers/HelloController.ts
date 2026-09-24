import type { HttpRequest } from '../contracts/HttpRequest';

export class HelloController {
	async handle(request: HttpRequest) {
		return {
			statusCode: 200,
			body: JSON.stringify({ request }),
		};
	}
}
