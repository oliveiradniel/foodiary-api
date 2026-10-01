import z from 'zod';

import { Profile } from '@application/entities/Profile';

export const signUpSchema = z.object({
	account: z.object({
		email: z.email('Invalid "email".').min(1, '"email" is required.'),
		password: z
			.string()
			.min(8, '"password" should be at least 8 characters long.'),
	}),
	profile: z.object({
		name: z.string().min(1, '"name" is required.'),
		birthDate: z.iso
			.date('"birthDate" should be a valid ISO date (YYYY-MM-DD).')
			.transform((date) => new Date(date)),
		gender: z.enum(Profile.Gender),
		height: z.number().positive('"height" must be a positive number.'),
		weight: z.number().positive('"weight" must be a positive number.'),
		activityLevel: z.enum(Profile.ActivityLevel),
		goal: z.enum(Profile.Goal),
	}),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
