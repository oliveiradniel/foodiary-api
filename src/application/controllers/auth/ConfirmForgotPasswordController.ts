import { Controller } from '@application/contracts/Controller';
import { InvalidConfirmationCode } from '@application/errors/application/InvalidConfirmationCode';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

// oxlint-disable-next-line typescript/consistent-type-imports
import { ConfirmForgotPasswordUseCase } from '@application/usecases/auth/ConfirmForgotPasswordUseCase';

import {
	confirmForgotPasswordSchema,
	type ConfirmForgotPasswordBody,
} from './schemas/confirmForgotPasswordSchema';

@Injectable()
@Schema(confirmForgotPasswordSchema)
export class ConfirmForgotPasswordController extends Controller<
	'public',
	void
> {
	constructor(
		private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase,
	) {
		super();
	}

	protected override async handle({
		body,
	}: Controller.Request<'public', ConfirmForgotPasswordBody>): Promise<
		Controller.Response<void>
	> {
		try {
			const { email, confirmationCode, newPassword } = body;

			await this.confirmForgotPasswordUseCase.execute({
				email,
				confirmationCode,
				newPassword,
			});

			return {
				statusCode: 204,
			};
		} catch (error) {
			if (
				error instanceof Error &&
				(error.name === 'CodeMismatchException' ||
					error.name === 'ExpiredCodeException')
			) {
				throw new InvalidConfirmationCode();
			}

			throw error;
		}
	}
}
