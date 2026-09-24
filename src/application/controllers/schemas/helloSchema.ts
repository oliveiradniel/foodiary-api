import z from 'zod';

export const helloSchema = z.object({
	accounts: z.object({
		name: z.string().trim().min(1, 'Name is required.'),
	}),
	email: z.email('Invalid email.').min(1, 'Email is required.'),
});

export type HelloBody = z.infer<typeof helloSchema>;
