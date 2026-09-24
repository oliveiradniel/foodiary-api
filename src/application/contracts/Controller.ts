export interface Controller<TBody = undefined> {
	handle(request: Controller.Request): Promise<Controller.Response<TBody>>;
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
