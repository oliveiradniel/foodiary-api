import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { GetProfileAndGoalQuery } from '@application/queries/GetProfileAndGoalQuery';

@Injectable()
export class GetMeController extends Controller<
	'private',
	GetMeController.Response
> {
	constructor(private readonly getProfileAndGoalQuery: GetProfileAndGoalQuery) {
		super();
	}

	protected override async handle({
		accountId,
	}: Controller.Request<'private'>): Promise<
		Controller.Response<GetMeController.Response>
	> {
		const response = await this.getProfileAndGoalQuery.execute({ accountId });

		return {
			statusCode: 200,
			body: {
				data: response,
			},
		};
	}
}

export namespace GetMeController {
	export type Response = {
		data: GetProfileAndGoalQuery.Output;
	};
}
