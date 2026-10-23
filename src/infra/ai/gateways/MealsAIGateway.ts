// oxlint-disable no-console
import { Injectable } from '@kernel/decorators/Injectable';

import { getImagePrompt } from '@infra/ai/prompts/getImagePrompt';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import dedent from 'ts-dedent';

import z from 'zod';

import { Meal } from '@application/entities/Meal';
// oxlint-disable-next-line typescript/consistent-type-imports
import { MealsFileStorageGateway } from '@infra/gateways/MealsFileStorageGateway';

const mealSchema = z.object({
	name: z.string(),
	icon: z.string(),
	foods: z.array(
		z.object({
			name: z.string(),
			quantity: z.string(),
			calories: z.number(),
			carbohydrates: z.number(),
			fats: z.number(),
			proteins: z.number(),
		}),
	),
});

@Injectable()
export class MealsAIGateway {
	constructor(
		private readonly mealsFileStorageGateway: MealsFileStorageGateway,
	) {}

	private readonly client = new OpenAI();

	async processMeal(meal: Meal): Promise<MealsAIGateway.ProcessMealResult> {
		if (meal.inputType === Meal.InputType.PICTURE) {
			const imageURL = this.mealsFileStorageGateway.getFileURL(
				meal.inputFileKey,
			);

			const localDate = meal.createdAt.toLocaleString('en-US', {
				timeZone: meal.timezone,
				dateStyle: 'full',
				timeStyle: 'short',
			});

			const response = await this.client.chat.completions.create({
				model: 'gpt-4.1-mini',
				response_format: zodResponseFormat(mealSchema, 'meal'),
				messages: [
					{
						role: 'system',
						content: getImagePrompt(),
					},
					{
						role: 'user',
						content: [
							{
								type: 'image_url',
								image_url: {
									url: imageURL,
									detail: 'high',
								},
							},
							{
								type: 'text',
								text: dedent`
                  Meal date: ${localDate}.
                  User timezone: ${meal.timezone}
                `,
							},
						],
					},
				],
			});

			const json = response.choices[0]?.message.content;

			if (!json) {
				console.error('OpenAI response:', JSON.stringify(response, null, 2));
				throw new Error(`Failed processing meal "${meal.id}"`);
			}

			const { success, data, error } = mealSchema.safeParse(JSON.parse(json));

			if (!success) {
				console.error('Zod error:', error);
				console.error('OpenAI response:', JSON.stringify(response, null, 2));
				throw new Error(`Failed processing meal "${meal.id}"`);
			}

			return data;
		}

		// audio
		return {
			name: '',
			icon: '',
			foods: [],
		};
	}
}

export namespace MealsAIGateway {
	export type ProcessMealResult = {
		name: string;
		icon: string;
		foods: Meal.Food[];
	};
}
