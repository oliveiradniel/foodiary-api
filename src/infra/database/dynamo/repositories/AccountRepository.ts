import { Injectable } from '@kernel/decorators/Injectable';

import { AccountItem } from '@application/entities/items/AccountItem';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Account } from '@application/entities/Account';

@Injectable()
export class AccountRepository {
	constructor(private readonly appConfig: AppConfig) {}

	async create(account: Account): Promise<void> {
		const accountItem = AccountItem.fromEntity(account);

		const command = new PutCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Item: accountItem.toItem(),
		});

		await dynamoClient.send(command);
	}
}
