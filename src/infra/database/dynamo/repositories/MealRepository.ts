import { Injectable } from '@kernel/decorators/Injectable';

import {
	GetCommand,
	PutCommand,
	UpdateCommand,
	type PutCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { MealItem } from '../items/MealItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Meal } from '@application/entities/Meal';

@Injectable()
export class MealRepository {
	constructor(private readonly appConfig: AppConfig) {}

	async findById({
		mealId,
		accountId,
	}: MealRepository.FindById): Promise<Meal | null> {
		const command = new GetCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Key: {
				PK: MealItem.getPK({ accountId, mealId }),
				SK: MealItem.getSK({ accountId, mealId }),
			},
		});

		const { Item: mealItem } = await dynamoClient.send(command);

		if (!mealItem) {
			return null;
		}

		return MealItem.toEntity(mealItem as MealItem.ItemType);
	}

	async save(meal: Meal): Promise<void> {
		const mealItem = MealItem.fromEntity(meal).toItem();

		const command = new UpdateCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Key: {
				PK: mealItem.PK,
				SK: mealItem.SK,
			},
			UpdateExpression:
				'SET #status = :status, #attempts = :attempts, #name = :name, #icon = :icon, #foods = :foods',
			ExpressionAttributeNames: {
				'#status': 'status',
				'#attempts': 'attempts',
				'#name': 'name',
				'#icon': 'icon',
				'#foods': 'foods',
			},
			ExpressionAttributeValues: {
				':status': mealItem.status,
				':attempts': mealItem.attempts,
				':name': mealItem.name,
				':icon': mealItem.icon,
				':foods': mealItem.foods,
			},
			ConditionExpression: 'attribute_exists(PK)',
		});

		await dynamoClient.send(command);
	}

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

export namespace MealRepository {
	export type FindById = {
		mealId: string;
		accountId: string;
	};
}
