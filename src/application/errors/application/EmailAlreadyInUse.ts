import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class EmailAlreadyInUse extends ApplicationError {
	public override statusCode = 409;

	public override code: ErrorCode;

	constructor() {
		super();

		this.name = 'EmailAlreadyInUse';
		this.message = 'This email is already in use.';
		this.code = ERROR_CODE.EMAIL_ALREADY_IN_USE;
	}
}
