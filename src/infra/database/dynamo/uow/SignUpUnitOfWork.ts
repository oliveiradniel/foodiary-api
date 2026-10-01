// oxlint-disable typescript/consistent-type-imports

import { Injectable } from '@kernel/decorators/Injectable';

import { UnitOfWork } from './UnitOfWork';

import { AccountRepository } from '../repositories/AccountRepository';
import { GoalRepository } from '../repositories/GoalRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';

import type { Account } from '@application/entities/Account';
import type { Goal } from '@application/entities/Goal';
import type { Profile } from '@application/entities/Profile';

@Injectable()
export class SignUpUnitOfWork extends UnitOfWork {
	constructor(
		private readonly accountRepo: AccountRepository,
		private readonly goalRepo: GoalRepository,
		private readonly profileRepo: ProfileRepository,
	) {
		super();
	}

	async run({ account, goal, profile }: SignUpUnitOfWork.RunParams) {
		this.addPut(this.accountRepo.getPutCommandInput(account));
		this.addPut(this.goalRepo.getPutCommandInput(goal));
		this.addPut(this.profileRepo.getPutCommandInput(profile));

		await this.commit();
	}
}

export namespace SignUpUnitOfWork {
	export type RunParams = {
		account: Account;
		goal: Goal;
		profile: Profile;
	};
}
