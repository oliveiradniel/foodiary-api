import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { ProcessMealUseCase } from '@application/usecases/meals/ProcessMealUseCase';

import type { QueueConsumer } from '@application/contracts/QueueConsumer';
import type { MealsQueueGateway } from '@infra/gateways/MealsQueueGateway';

@Injectable()
export class MealsQueueConsumer implements QueueConsumer<MealsQueueGateway.Message> {
	constructor(private readonly processMealUseCase: ProcessMealUseCase) {}

	async process({
		accountId,
		mealId,
	}: MealsQueueGateway.Message): Promise<void> {
		await this.processMealUseCase.execute({ accountId, mealId });
	}
}
