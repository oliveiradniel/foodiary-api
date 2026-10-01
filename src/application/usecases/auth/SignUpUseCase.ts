// oxlint-disable typescript/consistent-type-imports

import { Injectable } from '@kernel/decorators/Injectable';

import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { SignUpUnitOfWork } from '@infra/database/dynamo/uow/SignUpUnitOfWork';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Saga } from '@shared/saga/Saga';

import { Account } from '@application/entities/Account';
import { Goal } from '@application/entities/Goal';
import { Profile } from '@application/entities/Profile';

import { AccountRepository } from '@infra/database/dynamo/repositories/AccountRepository';

@Injectable()
export class SignUpUseCase {
	constructor(
		private readonly authGateway: AuthGateway,
		private readonly accountRepo: AccountRepository,
		private readonly signUpUow: SignUpUnitOfWork,
		private readonly saga: Saga,
	) {}

	async execute({
		account: { email, password },
		profile: { name, birthDate, gender, height, weight, activityLevel },
	}: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
		await this.saga.run<void>(async () => {
			const emailAlreadyInUse = await this.accountRepo.findByEmail(email);

			if (emailAlreadyInUse) {
				throw new EmailAlreadyInUse();
			}

			const account = new Account({ email });
			const profile = new Profile({
				accountId: account.id,
				name,
				birthDate,
				gender,
				height,
				weight,
				activityLevel,
			});
			const goal = new Goal({
				accountId: account.id,
				calories: 2500,
				proteins: 180,
				fats: 80,
				carbohydrates: 500,
			});

			const { externalId } = await this.authGateway.signUp({
				email,
				password,
				internalId: account.id,
			});

			this.saga.addCompensation(() =>
				this.authGateway.deleteUser({ externalId }),
			);

			account.externalId = externalId;

			await this.signUpUow.run({ account, goal, profile });
		});

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
		account: {
			email: string;
			password: string;
		};
		profile: {
			name: string;
			birthDate: Date;
			gender: Profile.Gender;
			height: number;
			weight: number;
			activityLevel: Profile.ActivityLevel;
		};
	};

	export type Output = {
		accessToken: string;
		refreshToken: string;
	};
}
