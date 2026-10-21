import type { QueueConsumer } from '@application/contracts/QueueConsumer';
import type { SQSHandler } from 'aws-lambda';

export function lambdaSQSAdapter(consumer: QueueConsumer<any>): SQSHandler {
	return async (event) => {
		await Promise.all(
			event.Records.map(async (record) => {
				const message = JSON.parse(record.body);

				await consumer.process(message);
			}),
		);
	};
}
