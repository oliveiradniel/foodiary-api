import z from 'zod';

export const updateGoalSchema = z.object({
	calories: z.number().positive('"calories" must be a positive number.'),
	proteins: z.number().positive('"proteins" must be a positive number.'),
	carbohydrates: z
		.number()
		.positive('"carbohydrates" must be a positive number.'),
	fats: z.number().positive('"fats" must be a positive number.'),
});

export type UpdateGoalBody = z.infer<typeof updateGoalSchema>;
