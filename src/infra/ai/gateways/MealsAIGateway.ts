// oxlint-disable no-console
import { Injectable } from '@kernel/decorators/Injectable';

import { getImagePrompt } from '@infra/ai/prompts/getImagePrompt';
import { getTextPrompt } from '@infra/ai/prompts/getTextPrompt';
import OpenAI, { toFile } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import dedent from 'ts-dedent';

import z from 'zod';

import { downloadFileFromURL } from '@utils/downloadFileFromURL';

import { Meal } from '@application/entities/Meal';
// oxlint-disable-next-line typescript/consistent-type-imports
import { MealsFileStorageGateway } from '@infra/gateways/MealsFileStorageGateway';

import type { ChatCompletionContentPart } from 'openai/resources';

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
		const mealFileURL = this.mealsFileStorageGateway.getFileURL(
			meal.inputFileKey,
		);

		const localDate = meal.createdAt.toLocaleString('en-US', {
			timeZone: meal.timezone,
			dateStyle: 'full',
			timeStyle: 'short',
		});

		if (meal.inputType === Meal.InputType.PICTURE) {
			return this.callAI({
				mealId: meal.id,
				systemPrompt: getImagePrompt(),
				userMessageParts: [
					{
						type: 'image_url',
						image_url: {
							url: mealFileURL,
							detail: 'high',
						},
					},
					{
						type: 'text',
						text: dedent`
                  Meal date: ${localDate}.
                  User timezone: ${meal.timezone}.
                `,
					},
				],
			});
		}

		const transcription = await this.transcribe(mealFileURL);

		return this.callAI({
			mealId: meal.id,
			systemPrompt: getTextPrompt(),
			userMessageParts: `Meal date: ${localDate}. User timezone: ${meal.timezone}.\n\nMeal: ${transcription}`,
		});
	}

	private async callAI({
		mealId,
		systemPrompt,
		userMessageParts,
	}: MealsAIGateway.CallAIParams): Promise<MealsAIGateway.ProcessMealResult> {
		const response = await this.client.chat.completions.create({
			model: 'gpt-4.1-mini',
			response_format: zodResponseFormat(mealSchema, 'meal'),
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: userMessageParts,
				},
			],
		});

		const json = response.choices[0]?.message.content;

		if (!json) {
			console.error('OpenAI response:', JSON.stringify(response, null, 2));
			throw new Error(`Failed processing meal "${mealId}"`);
		}

		const { success, data, error } = mealSchema.safeParse(JSON.parse(json));

		if (!success) {
			console.error('Zod error:', JSON.stringify(error.issues));
			console.error('OpenAI response:', JSON.stringify(response, null, 2));
			throw new Error(`Failed processing meal "${mealId}"`);
		}

		return data;
	}

	private async transcribe(mealFileURL: string) {
		const audioFile = await downloadFileFromURL(mealFileURL);

		const { text } = await this.client.audio.transcriptions.create({
			model: 'gpt-4o-mini-transcribe',
			file: await toFile(audioFile, 'audio.m4a', { type: 'audio/m4a' }),
		});

		return text;
	}
}

export namespace MealsAIGateway {
	export type ProcessMealResult = {
		name: string;
		icon: string;
		foods: Meal.Food[];
	};

	export type CallAIParams = {
		mealId: string;
		systemPrompt: string;
		userMessageParts: string | ChatCompletionContentPart[];
	};
}
