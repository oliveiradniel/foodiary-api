import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { Injectable } from '@kernel/decorators/Injectable';

// oxlint-disable-next-line typescript/consistent-type-imports
import { GoalRepository } from '@infra/database/dynamo/repositories/GoalRepository';

@Injectable()
export class UpdateGoalUseCase {
	constructor(private readonly goalRepo: GoalRepository) {}

	async execute({
		accountId,
		calories,
		proteins,
		carbohydrates,
		fats,
	}: UpdateGoalUseCase.Input): Promise<UpdateGoalUseCase.Output> {
		const goal = await this.goalRepo.findByAccountId(accountId);

		if (!goal) {
			throw new ResourceNotFound('Goal not found.');
		}

		goal.calories = calories;
		goal.proteins = proteins;
		goal.carbohydrates = carbohydrates;
		goal.fats = fats;

		await this.goalRepo.save(goal);
	}
}

export namespace UpdateGoalUseCase {
	export type Input = {
		accountId: string;
		calories: number;
		proteins: number;
		carbohydrates: number;
		fats: number;
	};

	export type Output = void;
}
