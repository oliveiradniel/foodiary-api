export const ERROR_CODE = {
	VALIDATION: 'VALIDATION',

	// HTTP
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
