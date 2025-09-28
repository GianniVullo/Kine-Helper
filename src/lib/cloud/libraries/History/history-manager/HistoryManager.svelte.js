/**
 ** HistoryManager.js
 ** la class HistoryManager est un singleton qui gère l'historique des actions
 ** effectuées par l'utilisateur dans l'application.
 *
 ** Il permet de créer des entrées dans l'historique et de les récupérer du serveur.
 ** Pour se faire :
 *? - il faut setup les Tauri listeners pour savoir quand les job commencent et finissent -> Création d'une méthode asynchrone pour setup les listeners
 *? mettre un onDelete pour cleanup les listeners si l'utilisateur se déconnecte
 *
 */
import { appState } from '../../../../managers/AppState.svelte';
import { supabase } from '../../../../stores/supabaseClient';
import { listen } from '@tauri-apps/api/event';
import { PromiseQueue } from './PromiseQueue.svelte';
import { executeJob } from './jobs';
import { executePostProcessingJob } from './postprocessing';
import { info } from '../../logging';

export class AsyncQueueManager {
	promiseQueue = new PromiseQueue();
	unlistenStarted;
	unlistenPostProcess;
	unlistenSuccess;
	unlistenFailed;

	constructor() {
		info('in AsyncQueueManager constructor');
	}

	/**
	 *
	 * @param {{label: string, job: string, data: string,}} task
	 */
	async addToQueue(task) {
		info('addToQueue ' + JSON.stringify(task));
		const taskId = crypto.randomUUID();
		this.promiseQueue.add(taskId, task.label);
		const session = await supabase.auth.getSession();
		if (session.error) {
			console.error('Error getting session:', session.error);
			return { error: session.error };
		}
		let options = {
			jobType: task.job,
			data: {
				id: taskId,
				data: JSON.stringify(task.data),
				token: session?.data?.session?.access_token,
				user_id: appState.user.id
			}
		};
		info('options', options);

		await executeJob(options);
	}

	setup() {
		return new Promise(async (resolve) => {
			if (!this.unlistenStarted) {
				this.unlistenStarted = await listen('job-started', (event) => {
					info('Started:', event.payload);
					this.setOperationStatus(event.payload, 'running');
					this.promiseQueue.running = true;
				});
			}

			if (!this.unlistenSuccess) {
				this.unlistenSuccess = await listen('job-success', (event) => {
					info('Success:', event.payload);
					this.setOperationStatus(event.payload, 'fulfilled');
					this.promiseQueue.running = false;
				});
			}

			if (!this.unlistenPostProcess) {
				this.unlistenPostProcess = await listen('job-post-process', async (event) => {
					info('Post Process:', event.payload);
					if (typeof event.payload === 'string') {
						event.payload = JSON.parse(event.payload);
					}
					await executePostProcessingJob(event.payload);
				});
			}

			if (!this.unlistenFailed) {
				this.unlistenFailed = await listen('job-failed', (event) => {
					info('Failed:', event.payload);
					this.setOperationStatus(event.payload, 'rejected');
					this.promiseQueue.running = false;
				});
			}
			resolve();
		});
	}

	findOperationIdx(id) {
		const opIndex = this.promiseQueue.operations.findIndex((op) => op.id === id);
		if (opIndex !== -1) {
			return opIndex;
		}
		return null;
	}

	setOperationStatus(id, status) {
		const opIndex = this.findOperationIdx(id);
		info('opIndex', opIndex);

		if (typeof opIndex === 'number') {
			info(
				'setting status for opé',
				status,
				$state.snapshot(this.promiseQueue.operations[opIndex])
			);
			this.promiseQueue.operations[opIndex].status = status;
		}
	}
}
