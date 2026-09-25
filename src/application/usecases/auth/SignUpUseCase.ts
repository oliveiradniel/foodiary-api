import { Injectable } from '@kernel/decorators/Injectable';

import { Account } from '@application/entities/Account';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AuthGateway } from '@infra/gateways/AuthGateway';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AccountRepository } from '@infra/database/dynamo/repositories/AccountRepository';

@Injectable()
export class SignUpUseCase {
	constructor(
		private readonly authGateway: AuthGateway,
		private readonly accountRepo: AccountRepository,
	) {}

	async execute({
		email,
		password,
	}: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
		const { externalId } = await this.authGateway.signUp({ email, password });

		const account = new Account({ email, externalId });
		await this.accountRepo.create(account);

		const { accessToken, refreshToken } = await this.authGateway.signIn({
			email,
			password,
		});

		return {
			accessToken,
			refreshToken,
		};
	}
}

export namespace SignUpUseCase {
	export type Input = {
		email: string;
		password: string;
	};
	export type Output = {
		accessToken: string;
		refreshToken: string;
	};
}
