import z from 'zod';

export const getMealByIdSchema = z.object({
	mealId: z.uuidv7('"mealId" must be a uuidv7'),
});

export type GetMealByIdParam = z.infer<typeof getMealByIdSchema>;
