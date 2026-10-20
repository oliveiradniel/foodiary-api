// oxlint-disable typescript/consistent-type-imports
import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { Injectable } from '@kernel/decorators/Injectable';

import { Meal } from '@application/entities/Meal';
import { MealRepository } from '@infra/database/dynamo/repositories/MealRepository';
import { MealsFileStorageGateway } from '@infra/gateways/MealsFileStorageGateway';

@Injectable()
export class MealUploadedUseCase {
	constructor(
		private readonly mealRepository: MealRepository,
		private readonly mealsFileStorageGateway: MealsFileStorageGateway,
	) {}

	async execute({
		fileKey,
	}: MealUploadedUseCase.Input): Promise<MealUploadedUseCase.Output> {
		const { accountId, mealId } =
			await this.mealsFileStorageGateway.getFileMetadata({ fileKey });

		const meal = await this.mealRepository.findById({
			accountId,
			mealId,
		});

		if (!meal) {
			throw new ResourceNotFound('Meal not found.');
		}

		meal.status = Meal.Status.QUEUED;

		await this.mealRepository.save(meal);
	}
}

export namespace MealUploadedUseCase {
	export type Input = { fileKey: string };
	export type Output = void;
}
