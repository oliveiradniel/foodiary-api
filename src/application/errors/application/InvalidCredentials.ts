import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class InvalidCredentials extends ApplicationError {
	public override statusCode = 401;

	public override code: ErrorCode;

	constructor() {
		super();

		this.name = 'InvalidCredentials';
		this.message = 'Invalid credentials.';
		this.code = ERROR_CODE.INVALID_CREDENTIALS;
	}
}
