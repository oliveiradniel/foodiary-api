import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { GetMealByIdUseCase } from '@application/usecases/meals/GetMealByIdUseCase';

import type { Meal } from '@application/entities/Meal';
import {
	getMealByIdSchema,
	type GetMealByIdParam,
} from './schemas/getMealByIdSchema';

@Injectable()
export class GetMealByIdController extends Controller<
	'private',
	GetMealByIdController.Response
> {
	constructor(private readonly getMealByIdUseCase: GetMealByIdUseCase) {
		super();
	}

	protected override async handle({
		accountId,
		params,
	}: GetMealByIdController.Request): Promise<
		Controller.Response<GetMealByIdController.Response>
	> {
		const { mealId } = getMealByIdSchema.parse(params);

		const { meal } = await this.getMealByIdUseCase.execute({
			accountId,
			mealId,
		});

		return {
			statusCode: 200,
			body: {
				meal: { ...meal, createdAt: meal.createdAt.toISOString() },
			},
		};
	}
}

export namespace GetMealByIdController {
	export type Request = Controller.Request<
		'private',
		Record<string, unknown>,
		GetMealByIdParam
	>;

	export type Response = {
		meal: {
			id: string;
			status: Meal.Status;
			inputType: Meal.InputType;
			inputFileKey: string;
			name: string;
			icon: string;
			foods: Meal.Food[];
			timezone: string;
			createdAt: string;
		};
	};
}
