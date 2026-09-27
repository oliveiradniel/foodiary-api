import z from 'zod';

export const confirmForgotPasswordSchema = z.object({
	email: z.email('Invalid "email".').min(1, '"email" is required.'),
	confirmationCode: z.string().min(1, '"confirmationCode" is required.'),
	newPassword: z
		.string()
		.min(8, '"newPassword" should be at least 8 characters long.'),
});

export type ConfirmForgotPasswordBody = z.infer<
	typeof confirmForgotPasswordSchema
>;
