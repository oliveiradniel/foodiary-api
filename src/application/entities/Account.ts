import { randomUUIDv7 } from 'node:crypto';

export class Account {
	readonly id: string;

	readonly email: string;

	externalId: string;

	readonly createdAt: Date;

	constructor(attr: Account.Attributes) {
		this.id = randomUUIDv7();
		this.email = attr.email;
		this.externalId = attr.externalId;
		this.createdAt = new Date();
	}
}

export namespace Account {
	export type Attributes = {
		email: string;
		externalId: string;
	};
}
