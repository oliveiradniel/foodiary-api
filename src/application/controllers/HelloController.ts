import z from 'zod';

import type { Controller } from '../contracts/Controller';

const schema = z.object({
	name: z.string().trim().min(1, 'Name is required.'),
	email: z.email('Invalid email.').min(1, 'Email is required.'),
});

export class HelloController implements Controller<unknown> {
	async handle(
		request: Controller.Request,
	): Promise<Controller.Response<unknown>> {
		const parsedBody = schema.parse(request.body);

		return {
			statusCode: 200,
			body: { parsedBody },
		};
	}
}
