import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { MealRepository } from '@infra/database/dynamo/repositories/MealRepository';

import type { Meal } from '@application/entities/Meal';

@Injectable()
export class GetMealByIdUseCase {
	constructor(private readonly mealRepo: MealRepository) {}

	async execute({
		accountId,
		mealId,
	}: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
		const meal = await this.mealRepo.findById({ accountId, mealId });

		if (!meal) {
			throw new ResourceNotFound('Meal not found.');
		}

		return {
			meal: {
				id: meal.id,
				status: meal.status,
				inputType: meal.inputType,
				inputFileKey: meal.inputFileKey,
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
			inputFileKey: string;
			name: string;
			icon: string;
			foods: Meal.Food[];
			timezone: string;
			createdAt: Date;
		};
	};
}
