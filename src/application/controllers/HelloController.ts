import { Controller } from '@application/contracts/Controller';
import { Schema } from '@kernel/decorators/Schema';

import { helloSchema, type HelloBody } from './schemas/helloSchema';

@Schema(helloSchema)
export class HelloController extends Controller<unknown> {
	protected override async handle(
		request: Controller.Request<HelloBody>,
	): Promise<Controller.Response<unknown>> {
		return {
			statusCode: 200,
			body: { parsedBody: request.body },
		};
	}
}
