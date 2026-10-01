import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class UserNotFound extends ApplicationError {
	public override statusCode = 404;

	public override code: ErrorCode;

	constructor() {
		super();

		this.name = 'UserNotFound';
		this.message = 'User not found.';
		this.code = ERROR_CODE.USER_NOT_FOUND;
	}
}
