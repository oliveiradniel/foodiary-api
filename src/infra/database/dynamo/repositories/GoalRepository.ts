import { Injectable } from '@kernel/decorators/Injectable';

import { PutCommand, type PutCommandInput } from '@aws-sdk/lib-dynamodb';

import { GoalItem } from '@infra/database/dynamo/items/GoalItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Goal } from '@application/entities/Goal';

@Injectable()
export class GoalRepository {
	constructor(private readonly appConfig: AppConfig) {}

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
