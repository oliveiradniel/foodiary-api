import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { ListMealsByDayQuery } from '@application/queries/ListMealsByDayQuery';

import type { Meal } from '@application/entities/Meal';
import {
	listMealsByDaySchema,
	type ListMealsByDayQueryParam,
} from './schemas/listMealsByDaySchema';

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
	}: ListMealsByDayController.Request): Promise<
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
	export type Request = Controller.Request<
		'private',
		Record<string, unknown>,
		Record<string, unknown>,
		ListMealsByDayQueryParam
	>;

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
