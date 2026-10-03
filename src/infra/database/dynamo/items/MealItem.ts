import { Meal } from '@application/entities/Meal';

export class MealItem {
	static readonly type = 'Meal';

	private readonly keys: MealItem.Keys;

	constructor(private readonly attrs: MealItem.Attributes) {
		this.keys = {
			PK: MealItem.getPK(this.attrs.id),
			SK: MealItem.getSK(this.attrs.id),
			GSI1PK: MealItem.getGSI1PK({
				accountId: this.attrs.accountId,
				date: MealItem.toLocalDate(
					new Date(this.attrs.createdAt),
					this.attrs.timezone,
				),
			}),
			GSI1SK: MealItem.getGSI1SK(this.attrs.id),
		};
	}

	toItem(): MealItem.ItemType {
		return {
			...this.attrs,
			...this.keys,
			type: MealItem.type,
		};
	}

	static fromEntity(meal: Meal) {
		return new MealItem({
			...meal,
			createdAt: meal.createdAt.toISOString(),
		});
	}

	static toEntity(mealItem: MealItem.ItemType) {
		return new Meal({
			id: mealItem.id,
			accountId: mealItem.accountId,
			status: mealItem.status,
			attempts: mealItem.attempts,
			inputType: mealItem.inputType,
			inputFileKey: mealItem.inputFileKey,
			name: mealItem.name,
			icon: mealItem.icon,
			foods: mealItem.foods,
			timezone: mealItem.timezone,
			createdAt: new Date(mealItem.createdAt),
		});
	}

	static getPK(mealId: string): MealItem.Keys['PK'] {
		return `MEAL#${mealId}`;
	}

	static getSK(mealId: string): MealItem.Keys['SK'] {
		return `MEAL#${mealId}`;
	}

	static getGSI1PK({
		accountId,
		date,
	}: MealItem.GSIPKParams): MealItem.Keys['GSI1PK'] {
		return `MEALS#${accountId}#${date}`;
	}

	// 'en-CA' formats as YYYY-MM-DD
	static toLocalDate(date: Date, timezone: string): string {
		return date.toLocaleDateString('en-CA', { timeZone: timezone });
	}

	static getGSI1SK(mealId: string): MealItem.Keys['GSI1SK'] {
		return `MEAL#${mealId}`;
	}
}

export namespace MealItem {
	export type Keys = {
		PK: `MEAL#${string}`;
		SK: `MEAL#${string}`;
		GSI1PK: `MEALS#${string}#${string}`;
		GSI1SK: `MEAL#${string}`;
	};

	export type Attributes = {
		id: string;
		accountId: string;
		status: Meal.Status;
		attempts: number;
		inputType: Meal.InputType;
		inputFileKey: string;
		name: string;
		icon: string;
		foods: Meal.Food[];
		timezone: string;
		createdAt: string;
	};

	export type ItemType = Keys & Attributes & { type: 'Meal' };

	export type GSIPKParams = {
		accountId: string;
		date: string;
	};
}
