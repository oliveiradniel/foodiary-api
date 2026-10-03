import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { ListMealsByDayQuery } from '@application/queries/ListMealsByDayQuery';

import { listMealsByDaySchema } from './schemas/listMealsByDaySchema';

import type { Meal } from '@application/entities/Meal';

@Injectable()
export class ListMealsByDayController extends Controller<
	'private',
	ListMealsByDayController.Response
> {
	constructor(private readonly listMealsByDayQuery: ListMealsByDayQuery) {
		super();
	}

	protected override async handle({
		accountId,
		queryParams,
	}: Controller.Request<'private'>): Promise<
		Controller.Response<ListMealsByDayController.Response>
	> {
		const { date } = listMealsByDaySchema.parse(queryParams);

		const { meals } = await this.listMealsByDayQuery.execute({
			accountId,
			date,
		});

		return {
			statusCode: 200,
			body: {
				meals,
			},
		};
	}
}

export namespace ListMealsByDayController {
	export type Response = {
		meals: {
			id: string;
			createdAt: string;
			name: string;
			icon: string;
			foods: Meal.Food[];
		}[];
	};
}
