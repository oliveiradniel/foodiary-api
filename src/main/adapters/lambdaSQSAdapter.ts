import { Registry } from '@kernel/di/Registry';

import type { QueueConsumer } from '@application/contracts/QueueConsumer';
import type { Constructor } from '@shared/types/Constructor';
import type { SQSHandler } from 'aws-lambda';

export function lambdaSQSAdapter(
	consumerImpl: Constructor<QueueConsumer<any>>,
): SQSHandler {
	return async (event) => {
		await Promise.all(
			event.Records.map(async (record) => {
				const consumer = Registry.getInstance().resolve(consumerImpl);
				const message = JSON.parse(record.body);

				await consumer.process(message);
			}),
		);
	};
}
