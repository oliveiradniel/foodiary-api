import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class TooManyAttempts extends ApplicationError {
	public override statusCode = 429;

	public override code: ErrorCode;

	constructor() {
		super();

		this.name = 'TooManyAttempts';
		this.message = 'Too many attempts. Please try again later.';
		this.code = ERROR_CODE.TOO_MANY_ATTEMPTS;
	}
}
