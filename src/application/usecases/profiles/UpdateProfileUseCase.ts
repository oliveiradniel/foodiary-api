import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { ProfileRepository } from '@infra/database/dynamo/repositories/ProfileRepository';

import type { Profile } from '@application/entities/Profile';

@Injectable()
export class UpdateProfileUseCase {
	constructor(private readonly profileRepo: ProfileRepository) {}

	async execute({
		accountId,
		name,
		birthDate,
		gender,
		height,
		weight,
	}: UpdateProfileUseCase.Input): Promise<UpdateProfileUseCase.Output> {
		const profile = await this.profileRepo.findByAccountId(accountId);

		if (!profile) {
			throw new ResourceNotFound('Profile not found.');
		}

		profile.name = name;
		profile.birthDate = birthDate;
		profile.gender = gender;
		profile.height = height;
		profile.weight = weight;

		await this.profileRepo.save(profile);
	}
}

export namespace UpdateProfileUseCase {
	export type Input = {
		accountId: string;
		name: string;
		birthDate: Date;
		gender: Profile.Gender;
		height: number;
		weight: number;
	};

	export type Output = void;
}
