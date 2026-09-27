import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

// oxlint-disable-next-line typescript/consistent-type-imports
import { ForgotPasswordUseCase } from '@application/usecases/auth/ForgotPasswordUseCase';

import {
	forgotPasswordSchema,
	type ForgotPasswordBody,
} from './schemas/forgotPasswordSchema';

@Injectable()
@Schema(forgotPasswordSchema)
export class ForgotPasswordController extends Controller<'public', void> {
	constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
		super();
	}

	protected override async handle({
		body,
	}: Controller.Request<'public', ForgotPasswordBody>): Promise<
		Controller.Response<void>
	> {
		const { email } = body;

		await this.forgotPasswordUseCase.execute({
			email,
		});

		return {
			statusCode: 204,
		};
	}
}
