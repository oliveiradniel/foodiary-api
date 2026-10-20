import { Injectable } from '@kernel/decorators/Injectable';

import type { FileEventHandler } from '@application/contracts/FileEventHandler';

@Injectable()
export class MealUploadedFileEventHandler implements FileEventHandler {
	async handle({ fileKey }: FileEventHandler.Input): Promise<void> {
		console.log({ MealUploadedFileEventHandler: fileKey });
	}
}
