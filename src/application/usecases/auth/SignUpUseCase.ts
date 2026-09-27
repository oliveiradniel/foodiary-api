import { Injectable } from '@kernel/decorators/Injectable';

import { Account } from '@application/entities/Account';
import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
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
		const emailAlreadyInUse = await this.accountRepo.findByEmail(email);

		if (emailAlreadyInUse) {
			throw new EmailAlreadyInUse();
		}

		const account = new Account({ email });
		const { externalId } = await this.authGateway.signUp({
			email,
			password,
			internalId: account.id,
		});

		account.externalId = externalId;

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
