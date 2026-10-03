import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

// oxlint-disable-next-line typescript/consistent-type-imports
import { CreateMealUseCase } from '@application/usecases/meals/CreateMealUseCase';

import { Meal } from '@application/entities/Meal';
import {
	createMealSchema,
	type CreateMealBody,
} from './schemas/createMealSchema';

@Injectable()
@Schema(createMealSchema)
export class CreateMealController extends Controller<
	'private',
	CreateMealController.Response
> {
	constructor(private readonly createMealUseCase: CreateMealUseCase) {
		super();
	}

	protected override async handle({
		accountId,
		body,
	}: Controller.Request<'private', CreateMealBody>): Promise<
		Controller.Response<CreateMealController.Response>
	> {
		const { file, timezone } = body;
		const inputType =
			file.type === 'audio/m4a' ? Meal.InputType.AUDIO : Meal.InputType.PICTURE;

		const { mealId, uploadSignature } = await this.createMealUseCase.execute({
			accountId,
			timezone,
			file: {
				size: file.size,
				inputType,
			},
		});

		return {
			statusCode: 201,
			body: {
				mealId,
				uploadSignature,
			},
		};
	}
}

export namespace CreateMealController {
	export type Response = { mealId: string; uploadSignature: string };
}
