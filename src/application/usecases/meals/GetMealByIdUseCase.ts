// oxlint-disable typescript/consistent-type-imports

import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { Injectable } from '@kernel/decorators/Injectable';

import { MealRepository } from '@infra/database/dynamo/repositories/MealRepository';
import { MealsFileStorageGateway } from '@infra/gateways/MealsFileStorageGateway';

import type { Meal } from '@application/entities/Meal';

@Injectable()
export class GetMealByIdUseCase {
	constructor(
		private readonly mealRepo: MealRepository,
		private readonly mealsFileStorageGateway: MealsFileStorageGateway,
	) {}

	async execute({
		accountId,
		mealId,
	}: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
		const meal = await this.mealRepo.findById({ accountId, mealId });

		if (!meal) {
			throw new ResourceNotFound('Meal not found.');
		}

		const inputFileURL = this.mealsFileStorageGateway.getFileURL(
			meal.inputFileKey,
		);

		return {
			meal: {
				id: meal.id,
				status: meal.status,
				inputType: meal.inputType,
				inputFileURL,
				name: meal.name,
				icon: meal.icon,
				foods: meal.foods,
				timezone: meal.timezone,
				createdAt: meal.createdAt,
			},
		};
	}
}

export namespace GetMealByIdUseCase {
	export type Input = {
		accountId: string;
		mealId: string;
	};

	export type Output = {
		meal: {
			id: string;
			status: Meal.Status;
			inputType: Meal.InputType;
			inputFileURL: string;
			name: string;
			icon: string;
			foods: Meal.Food[];
			timezone: string;
			createdAt: Date;
		};
	};
}
