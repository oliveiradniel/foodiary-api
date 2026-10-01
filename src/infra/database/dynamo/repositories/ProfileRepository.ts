import { Injectable } from '@kernel/decorators/Injectable';

import { PutCommand } from '@aws-sdk/lib-dynamodb';

import { ProfileItem } from '@infra/database/dynamo/items/ProfileItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Profile } from '@application/entities/Profile';

@Injectable()
export class ProfileRepository {
	constructor(private readonly appConfig: AppConfig) {}

	async create(profile: Profile): Promise<void> {
		const profileItem = ProfileItem.fromEntity(profile);

		const command = new PutCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Item: profileItem.toItem(),
		});

		await dynamoClient.send(command);
	}
}
