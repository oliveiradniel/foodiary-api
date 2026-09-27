import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { AuthGateway } from '@infra/gateways/AuthGateway';

@Injectable()
export class ConfirmForgotPasswordUseCase {
	constructor(private readonly authGateway: AuthGateway) {}

	async execute({
		email,
		confirmationCode,
		newPassword,
	}: ConfirmForgotPasswordUseCase.Input): Promise<ConfirmForgotPasswordUseCase.Output> {
		await this.authGateway.confirmForgotPassword({
			email,
			confirmationCode,
			newPassword,
		});
	}
}

export namespace ConfirmForgotPasswordUseCase {
	export type Input = {
		email: string;
		confirmationCode: string;
		newPassword: string;
	};

	export type Output = void;
}
