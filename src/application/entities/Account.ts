import { randomUUIDv7 } from 'node:crypto';

export class Account {
	readonly id: string;

	readonly email: string;

	externalId: string | undefined;

	readonly createdAt: Date;

	constructor(attr: Account.Attributes) {
		this.id = attr.id ?? randomUUIDv7();
		this.email = attr.email;
		this.externalId = attr.externalId;
		this.createdAt = attr.createdAt ?? new Date();
	}
}

export namespace Account {
	export type Attributes = {
		email: string;
		externalId?: string | undefined;
		id?: string;
		createdAt?: Date;
	};
}
