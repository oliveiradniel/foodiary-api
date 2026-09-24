import { HttpError } from './HttpError';

import { ERROR_CODE, type ErrorCode } from '../ErrorCode';

export class BadRequest extends HttpError {
	public override statusCode = 400;
	public override code: ErrorCode;

	constructor(message?: any, code?: ErrorCode) {
		super();

		this.name = 'BadRequest';
		this.message = message ?? 'Bad Request';
		this.code = code ?? ERROR_CODE.BAD_REQUEST;
	}
}
