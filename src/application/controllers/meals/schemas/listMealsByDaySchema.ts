import z from 'zod';

export const listMealsByDaySchema = z.object({
	date: z.iso.date('"date" should be a valid ISO date (YYYY-MM-DD).'),
});
