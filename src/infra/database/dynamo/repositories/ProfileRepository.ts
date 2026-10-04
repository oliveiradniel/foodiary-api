import { Injectable } from '@kernel/decorators/Injectable';

import {
	GetCommand,
	PutCommand,
	UpdateCommand,
	type PutCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { ProfileItem } from '@infra/database/dynamo/items/ProfileItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Profile } from '@application/entities/Profile';

@Injectable()
export class ProfileRepository {
	constructor(private readonly appConfig: AppConfig) {}

	async findByAccountId(accountId: string): Promise<Profile | null> {
		const command = new GetCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Key: {
				PK: ProfileItem.getPK(accountId),
				SK: ProfileItem.getSK(accountId),
			},
		});

		const { Item: profileItem } = await dynamoClient.send(command);

		if (!profileItem) {
			return null;
		}

		return ProfileItem.toEntity(profileItem as ProfileItem.ItemType);
	}

	async save(profile: Profile): Promise<void> {
		const profileItem = ProfileItem.fromEntity(profile).toItem();

		const command = new UpdateCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Key: {
				PK: profileItem.PK,
				SK: profileItem.SK,
			},
			UpdateExpression:
				'SET #name = :name, #birthDate = :birthDate, #gender = :gender, #height = :height, #weight = :weight',
			ExpressionAttributeNames: {
				'#name': 'name',
				'#birthDate': 'birthDate',
				'#gender': 'gender',
				'#height': 'height',
				'#weight': 'weight',
			},
			ExpressionAttributeValues: {
				':name': profileItem.name,
				':birthDate': profileItem.birthDate,
				':gender': profileItem.gender,
				':height': profileItem.height,
				':weight': profileItem.weight,
			},
			ReturnValues: 'NONE',
		});

		await dynamoClient.send(command);
	}

	getPutCommandInput(profile: Profile): PutCommandInput {
		const profileItem = ProfileItem.fromEntity(profile);

		return {
			TableName: this.appConfig.db.dynamodb.mainTable,
			Item: profileItem.toItem(),
		};
	}

	async create(profile: Profile): Promise<void> {
		const command = new PutCommand(this.getPutCommandInput(profile));

		await dynamoClient.send(command);
	}
}
