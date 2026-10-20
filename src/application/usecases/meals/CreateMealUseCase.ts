import { Injectable } from '@kernel/decorators/Injectable';

import { Meal } from '@application/entities/Meal';

// oxlint-disable-next-line typescript/consistent-type-imports
import { MealRepository } from '@infra/database/dynamo/repositories/MealRepository';
import { MealsFileStorageGateway } from '@infra/gateways/MealsFileStorageGateway';

@Injectable()
export class CreateMealUseCase {
	constructor(
		private readonly mealRepo: MealRepository,
		private readonly mealsFileStorageGateway: MealsFileStorageGateway,
	) {}

	async execute({
		accountId,
		timezone,
		file,
	}: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
		const inputFileKey = MealsFileStorageGateway.generateInputFileKey({
			accountId,
			inputType: file.inputType,
		});

		const meal = new Meal({
			accountId,
			inputType: file.inputType,
			status: Meal.Status.UPLOADING,
			inputFileKey,
			timezone,
		});

		const [, { uploadSignature }] = await Promise.all([
			this.mealRepo.create(meal),
			this.mealsFileStorageGateway.createPOST({
				mealId: meal.id,
				accountId,
				file: {
					key: inputFileKey,
					size: file.size,
					inputType: file.inputType,
				},
			}),
		]);

		return {
			mealId: meal.id,
			uploadSignature,
		};
	}
}

export namespace CreateMealUseCase {
	export type Input = {
		accountId: string;
		timezone: string;
		file: {
			inputType: Meal.InputType;
			size: number;
		};
	};

	export type Output = {
		mealId: string;
		uploadSignature: string;
	};
}
