import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { MealUploadedUseCase } from '@application/usecases/meals/MealUploadedUseCase';

import type { FileEventHandler } from '@application/contracts/FileEventHandler';

@Injectable()
export class MealUploadedFileEventHandler implements FileEventHandler {
	constructor(private readonly mealUploadedUseCase: MealUploadedUseCase) {}

	async handle({ fileKey }: FileEventHandler.Input): Promise<void> {
		await this.mealUploadedUseCase.execute({ fileKey });
	}
}
