import { Injectable } from '@kernel/decorators/Injectable';

import type { QueueConsumer } from '@application/contracts/QueueConsumer';
import type { MealsQueueGateway } from '@infra/gateways/MealsQueueGateway';

@Injectable()
export class MealsQueueConsumer implements QueueConsumer<MealsQueueGateway.Message> {
	async process({
		accountId,
		mealId,
	}: MealsQueueGateway.Message): Promise<void> {
		console.log(JSON.stringify({ accountId, mealId }, null, 2));
	}
}
