import { ApplicationError } from '@application/errors/application/ApplicationError';

import { ERROR_CODE, type ErrorCode } from '@application/errors/ErrorCode';

export class ResourceNotFound extends ApplicationError {
	public override statusCode = 404;

	public override code: ErrorCode;

	constructor(message?: string) {
		super();

		this.name = 'ResourceNotFound';
		this.message = message ?? 'The resource was not found.';
		this.code = ERROR_CODE.RESOURCE_NOT_FOUND;
	}
}
