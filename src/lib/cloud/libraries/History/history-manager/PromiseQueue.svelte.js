import dayjs from "dayjs";

export class PromiseQueue {
	operations = $state([]);
	errorList = $derived(this.operations.map((operation) => operation.error));
	running = $state(false);

	add(taskId, label) {
		const wrappedTask = {
			id: taskId,
			label,
			status: 'pending',
			result: null,
			error: null,
			date: dayjs().format('HH:mm'),
		};

		this.operations.push(wrappedTask);
		console.log('Task added to queue:', taskId);
		return {
			status: 'pending'
		};
	}

	async runNext() {
		if (this.running || this.operations.length === 0) return;
		this.running = true;

		console.log('Running next task in queue:', this.operations);
		const nextOperation = this.operations.find((p) => p.status === 'pending');
		if (nextOperation) {
			await nextOperation.run();
			console.log('Task completed:', this.operations[0]?.id);
			delete nextOperation.run;
			this.running = false;
			await tick();
			this.runNext(); // Continue with the next in queue
		} else {
			this.running = false;
		}
	}

	getStatuses() {
		return this.operations.map((entry) => entry.status);
	}
}
