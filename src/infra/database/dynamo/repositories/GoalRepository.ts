import { Injectable } from '@kernel/decorators/Injectable';

import {
	GetCommand,
	PutCommand,
	UpdateCommand,
	type PutCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { GoalItem } from '@infra/database/dynamo/items/GoalItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Goal } from '@application/entities/Goal';

@Injectable()
export class GoalRepository {
	constructor(private readonly appConfig: AppConfig) {}

	async findByAccountId(accountId: string): Promise<Goal | null> {
		const command = new GetCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Key: {
				PK: GoalItem.getPK(accountId),
				SK: GoalItem.getSK(accountId),
			},
		});

		const { Item: goalItem } = await dynamoClient.send(command);

		if (!goalItem) {
			return null;
		}

		return GoalItem.toEntity(goalItem as GoalItem.ItemType);
	}

	async save(goal: Goal): Promise<void> {
		const goalItem = GoalItem.fromEntity(goal).toItem();

		const command = new UpdateCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Key: {
				PK: goalItem.PK,
				SK: goalItem.SK,
			},
			UpdateExpression:
				'SET #calories = :calories, #proteins = :proteins, #carbohydrates = :carbohydrates, #fats = :fats',
			ExpressionAttributeNames: {
				'#calories': 'calories',
				'#proteins': 'proteins',
				'#carbohydrates': 'carbohydrates',
				'#fats': 'fats',
			},
			ExpressionAttributeValues: {
				':calories': goalItem.calories,
				':proteins': goalItem.proteins,
				':carbohydrates': goalItem.carbohydrates,
				':fats': goalItem.fats,
			},
			ReturnValues: 'NONE',
		});

		await dynamoClient.send(command);
	}

	getPutCommandInput(goal: Goal): PutCommandInput {
		const goalItem = GoalItem.fromEntity(goal);

		return {
			TableName: this.appConfig.db.dynamodb.mainTable,
			Item: goalItem.toItem(),
		};
	}

	async create(goal: Goal): Promise<void> {
		const command = new PutCommand(this.getPutCommandInput(goal));

		await dynamoClient.send(command);
	}
}
