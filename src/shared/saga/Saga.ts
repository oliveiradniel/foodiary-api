type CompensationFn = () => Promise<unknown>;

export class Saga {
	private compensations: CompensationFn[] = [];

	addCompensation(compensation: CompensationFn) {
		this.compensations.unshift(compensation);
	}

	async run<TResult>(fn: () => Promise<TResult>): Promise<TResult> {
		try {
			return await fn();
		} catch (error) {
			await this.compensate();

			throw error;
		} finally {
			this.compensations = [];
		}
	}

	async compensate() {
		for (const compensation of this.compensations) {
			try {
				await compensation();
			} catch (error) {
				// oxlint-disable-next-line no-console
				console.error('Saga compensation failed', error);
			}
		}
	}
}
