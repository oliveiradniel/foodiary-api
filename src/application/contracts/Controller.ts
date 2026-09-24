import type z from 'zod';

export abstract class Controller<TBody = undefined> {
	protected schema?: z.ZodType;

	protected abstract handle(
		request: Controller.Request,
	): Promise<Controller.Response<TBody>>;

	public execute(
		request: Controller.Request,
	): Promise<Controller.Response<TBody>> {
		const body = this.validateBody(request.body) as Controller.Request['body'];

		return this.handle({ ...request, body });
	}

	private validateBody(body: Controller.Request['body']) {
		if (!this.schema) {
			return body;
		}

		return this.schema.parse(body);
	}
}

export namespace Controller {
	export type Request<
		TBody = Record<string, unknown>,
		TParams = Record<string, unknown>,
		TQueryParams = Record<string, unknown>,
	> = {
		body: TBody;
		params: TParams;
		queryParams: TQueryParams;
	};

	export type Response<TBody = undefined> = {
		statusCode: number;
		body?: TBody;
	};
}
