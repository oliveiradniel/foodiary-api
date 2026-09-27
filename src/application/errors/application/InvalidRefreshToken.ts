import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class InvalidRefreshToken extends ApplicationError {
	public override statusCode = 401;

	public override code: ErrorCode;

	constructor() {
		super();

		this.name = 'InvalidRefreshToken';
		this.message = 'Invalid or expired refresh token.';
		this.code = ERROR_CODE.INVALID_REFRESH_TOKEN;
	}
}
