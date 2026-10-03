import { Injectable } from '@kernel/decorators/Injectable';

import { PutCommand, type PutCommandInput } from '@aws-sdk/lib-dynamodb';

import { MealItem } from '../items/MealItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Meal } from '@application/entities/Meal';

@Injectable()
export class MealRepository {
	constructor(private readonly appConfig: AppConfig) {}

	getPutCommandInput(meal: Meal): PutCommandInput {
		const mealItem = MealItem.fromEntity(meal);

		return {
			TableName: this.appConfig.db.dynamodb.mainTable,
			Item: mealItem.toItem(),
		};
	}

	async create(meal: Meal): Promise<void> {
		const command = new PutCommand(this.getPutCommandInput(meal));

		await dynamoClient.send(command);
	}
}
