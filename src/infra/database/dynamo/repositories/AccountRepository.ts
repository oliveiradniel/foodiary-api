import { Injectable } from '@kernel/decorators/Injectable';

import {
	PutCommand,
	QueryCommand,
	type PutCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { AccountItem } from '@infra/database/dynamo/items/AccountItem';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { dynamoClient } from '@infra/clients/dynamoClient';

import type { Account } from '@application/entities/Account';

@Injectable()
export class AccountRepository {
	constructor(private readonly appConfig: AppConfig) {}

	getPutCommandInput(account: Account): PutCommandInput {
		const accountItem = AccountItem.fromEntity(account);

		return {
			TableName: this.appConfig.db.dynamodb.mainTable,
			Item: accountItem.toItem(),
		};
	}

	async findByEmail(email: string): Promise<Account | null> {
		const command = new QueryCommand({
			IndexName: 'GSI1',
			TableName: this.appConfig.db.dynamodb.mainTable,
			Limit: 1,
			KeyConditionExpression: '#GSI1PK = :GSI1PK AND #GSI1SK = :GSI1SK',
			ExpressionAttributeNames: {
				'#GSI1PK': 'GSI1PK',
				'#GSI1SK': 'GSI1SK',
			},
			ExpressionAttributeValues: {
				':GSI1PK': AccountItem.getGSI1PK(email),
				':GSI1SK': AccountItem.getGSI1SK(email),
			},
		});

		const { Items = [] } = await dynamoClient.send(command);
		const account = Items[0] as AccountItem.ItemType | undefined;

		if (!account) {
			return null;
		}

		return AccountItem.toEntity(account);
	}

	async create(account: Account): Promise<void> {
		const command = new PutCommand(this.getPutCommandInput(account));

		await dynamoClient.send(command);
	}
}
