import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class InvalidConfirmationCode extends ApplicationError {
	public override statusCode = 400;

	public override code: ErrorCode;

	constructor() {
		super();

		this.name = 'InvalidConfirmationCode';
		this.message = 'Invalid or expired confirmation code.';
		this.code = ERROR_CODE.INVALID_CONFIRMATION_CODE;
	}
}
