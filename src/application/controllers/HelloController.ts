import type { Controller } from '../contracts/Controller';

export class HelloController implements Controller<unknown> {
	async handle(
		request: Controller.Request,
	): Promise<Controller.Response<unknown>> {
		return {
			statusCode: 200,
			body: { request },
		};
	}
}
