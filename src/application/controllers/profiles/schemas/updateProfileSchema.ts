import z from 'zod';

import { Profile } from '@application/entities/Profile';

export const updateProfileSchema = z.object({
	name: z.string().min(1, '"name" is required.'),
	birthDate: z.iso
		.date('"birthDate" should be a valid ISO date (YYYY-MM-DD).')
		.transform((date) => new Date(date)),
	gender: z.enum(Profile.Gender),
	height: z.number().positive('"height" must be a positive number.'),
	weight: z.number().positive('"weight" must be a positive number.'),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
