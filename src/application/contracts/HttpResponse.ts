export interface HttpResponse<TBody = undefined> {
	statusCode: number;
	body?: TBody;
}
