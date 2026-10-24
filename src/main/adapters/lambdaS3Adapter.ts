import { Registry } from '@kernel/di/Registry';

import type { FileEventHandler } from '@application/contracts/FileEventHandler';
import type { Constructor } from '@shared/types/Constructor';
import type { S3Handler } from 'aws-lambda';

export function lambdaS3Adapter(
	eventHandlerImpl: Constructor<FileEventHandler>,
): S3Handler {
	return async (event) => {
		const responses = await Promise.allSettled(
			event.Records.map((record) => {
				const eventHandler = Registry.getInstance().resolve(eventHandlerImpl);

				return eventHandler.handle({
					fileKey: record.s3.object.key,
				});
			}),
		);

		const failedEvents = responses.filter(
			(response) => response.status === 'rejected',
		);

		for (const event of failedEvents) {
			// oxlint-disable-next-line no-console
			console.error(JSON.stringify(event.reason, null, 2));
		}
	};
}
