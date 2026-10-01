import { Injectable } from '@kernel/decorators/Injectable';

import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infra/clients/dynamoClient';

// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { AccountItem } from '@infra/database/dynamo/items/AccountItem';
import { GoalItem } from '@infra/database/dynamo/items/GoalItem';
import { ProfileItem } from '@infra/database/dynamo/items/ProfileItem';

import type { Profile } from '@application/entities/Profile';

@Injectable()
export class GetProfileAndGoalQuery {
	constructor(private readonly appConfig: AppConfig) {}

	async execute({
		accountId,
	}: GetProfileAndGoalQuery.Input): Promise<GetProfileAndGoalQuery.Output> {
		// PK = ACCOUNT#<accountId>, SK = begins_with(ACCOUNT#<accountId>#)
		const command = new QueryCommand({
			TableName: this.appConfig.db.dynamodb.mainTable,
			Limit: 2,
			ProjectionExpression:
				'#name, #birthDate, #gender, #height, #weight, #calories, #proteins, #fats, #carbohydrates, #type',
			KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
			ExpressionAttributeNames: {
				'#PK': 'PK',
				'#SK': 'SK',
				'#name': 'name',
				'#birthDate': 'birthDate',
				'#gender': 'gender',
				'#height': 'height',
				'#weight': 'weight',
				'#calories': 'calories',
				'#proteins': 'proteins',
				'#fats': 'fats',
				'#carbohydrates': 'carbohydrates',
				'#type': 'type',
			},
			ExpressionAttributeValues: {
				':PK': AccountItem.getPK(accountId),
				':SK': `${AccountItem.getPK(accountId)}#`,
			},
		});

		const { Items = [] } = await dynamoClient.send(command);

		const profileData = Items.find(
			(item): item is GetProfileAndGoalQuery.ProfileItemType =>
				item.type === ProfileItem.type,
		);
		const goalData = Items.find(
			(item): item is GetProfileAndGoalQuery.GoalItemType =>
				item.type === GoalItem.type,
		);

		if (!profileData || !goalData) {
			throw new ResourceNotFound('Account profile or goal not found');
		}

		const { type: _profileType, ...profile } = profileData;
		const { type: _goalType, ...goal } = goalData;

		return { profile, goal };
	}
}

export namespace GetProfileAndGoalQuery {
	export type Input = { accountId: string };

	export type ProfileItemType = {
		name: string;
		birthDate: string;
		gender: Profile.Gender;
		height: number;
		weight: number;
		type: typeof ProfileItem.type;
	};

	export type GoalItemType = {
		calories: number;
		proteins: number;
		fats: number;
		carbohydrates: number;
		type: typeof GoalItem.type;
	};

	export type Output = {
		profile: Omit<GetProfileAndGoalQuery.ProfileItemType, 'type'>;
		goal: Omit<GetProfileAndGoalQuery.GoalItemType, 'type'>;
	};
}
