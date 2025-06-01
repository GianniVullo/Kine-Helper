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

import { invoke } from '@tauri-apps/api/core';
import { appState } from '../../../../managers/AppState.svelte';
import { supabase } from '../../../../stores/supabaseClient';
import { onDestroy } from 'svelte';
import { listen } from '@tauri-apps/api/event';
import { PromiseQueue } from './PromiseQueue.svelte';
import { executeJob } from './jobs';

export class AsyncQueueManager {
	promiseQueue = new PromiseQueue();
	unlistenStarted;
	unlistenSuccess;
	unlistenFailed;

	constructor() {
		console.log('in AsyncQueueManager constructor');
	}

	/**
	 *
	 * @param {{label: string, job: string, data: string,}} task
	 */
	async addToQueue(task) {
		console.log('addToQueue', task);
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
		console.log('options', options);

		await executeJob(options);
	}

	setup() {
		return new Promise(async (resolve) => {
			if (!this.unlistenStarted) {
				this.unlistenStarted = await listen('job-started', (event) => {
					console.log('Started:', event.payload);
					this.setOperationStatus(event.payload, 'running');
					this.promiseQueue.running = true;
				});
			}

			if (!this.unlistenSuccess) {
				this.unlistenSuccess = await listen('job-success', (event) => {
					console.log('Success:', event.payload);
					this.setOperationStatus(event.payload, 'fulfilled');
					this.promiseQueue.running = false;
				});
			}

			if (!this.unlistenFailed) {
				this.unlistenFailed = await listen('job-failed', (event) => {
					console.log('Failed:', event.payload);
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
		console.log('opIndex', opIndex);

		if (typeof opIndex === 'number') {
			console.log(
				'setting status for opé',
				status,
				$state.snapshot(this.promiseQueue.operations[opIndex])
			);
			this.promiseQueue.operations[opIndex].status = status;
		}
	}

	async sendToRemoteDB(table, action, data) {
		/**
		 ** - crée le noeud sur le cloud
		 ** - le cloud répond avec le numéro d'ordre du noeud
		 ** - on vérifie que le noeud est bien dans la continuité de l'historique
		 **     - si oui,
		 **         - on l'ajoute à l'historique
		 **     - si non,
		 **         - on fetch les noeuds manquants
		 **         - on les effectue
		 **         - on les ajoute à l'historique
		 **
		 */
		const p_data = await this.payloadBuilder(table, action, data);
		console.log('p_data', p_data);
		const { data: order_number, error } = await supabase.rpc('insert_history_node', p_data);
		console.log('order_number', order_number);
		const { error: comparingError } = await this.compareHistory(order_number);
		if (comparingError) {
			console.error('Error comparing history:', comparingError);
			return { error: comparingError };
		}

		payload.order_number = order_number;

		const { error: localDBError } = await appState.db.insert('modification_history', payload);
		if (localDBError) {
			console.error('localDBError inserting history entry:', localDBError);
			return { error: localDBError };
		}
	}

	async compareHistory(order_number) {
		/**
		 ** - si l'argument order_number est null
		 **     - Fetch le dernier noeud sur le cloud
		 *
		 ** - Fetch le dernier noeud sur la db
		 *
		 ** - Comparer le numéro d'ordre du dernier noeud local avec celui du cloud reçu en argument
		 **     - Si local + 1 < cloud
		 **         - Fetch tous les noeuds entre le dernier local et le cloud
		 **         - Effectuer les noeuds
		 **         - Ajouter les noeuds à l'historique
		 **         - Return;
		 *
		 **     - Si local + 1 == cloud
		 **        - Return;
		 */
		if (!order_number) {
			const { data: order_numberRemoteList, error: remoteErr } = await supabase
				.from('modification_history')
				.select('order_number')
				.order('order_number', { ascending: false })
				.limit(1);
			if (remoteErr) {
				console.error('remoteErr fetching history entry:', remoteErr);
				return { error: remoteErr };
			}
			if (order_numberRemoteList.length === 0) {
				return { error: 'No history entry found' };
			}
			order_number = order_numberRemoteList[0]?.order_number;
		}
		const { data: order_numberList, error: localError } = await appState.db.select(
			'SELECT order_number FROM modification_history ORDER BY order_number DESC LIMIT 1'
		);
		if (localError) {
			console.error('localError fetching history entry:', localError);
			return { error: localError };
		}
		const lastOrderNumber = order_numberList[0]?.order_number;
		if (lastOrderNumber === undefined) {
			return { error: 'No history entry found' };
		}
		if (lastOrderNumber + 1 < order_number) {
			const { data: missingNodes, error: remoteError } = await supabase
				.from('modification_history')
				.select('*')
				.gt('order_number', lastOrderNumber)
				.lt('order_number', order_number);
			if (remoteError) {
				console.error('remoteError fetching history entries:', remoteError);
				return { remoteError };
			}
			if (missingNodes.length === 0) {
				return { error: 'No missing history entries found' };
			}
			for (const historyNode of missingNodes) {
				await this.payloadExecuter(historyNode);
			}
		}
	}

	/**
	 * PayloadBuilder crée une entrée d'historique
	 * @param {string} table - L'action effectuée par l'utilisateur (sql)
	 * @param {string} action - L'action effectuée par l'utilisateur (sql)
	 * @param {{}} data - Les données associées à l'action
	 */
	async payloadBuilder(table, action, data) {
		const encryptedPayload = await this.encrypt(data);
		return {
			table,
			action,
			data: encryptedPayload
		};
	}

	async payloadExecuter(payload) {
		const { table, action, data } = payload;
		const decryptedData = await this.decrypt(data);
		let localResponse;
		switch (action) {
			case 'update':
				localResponse = await appState.db.update(table, decryptedData);
			case 'insert':
				localResponse = await appState.db.insert(table, decryptedData);
			case 'delete':
				const transformedData = Object.entries(decryptedData);
				localResponse = await appState.db.delete(table, transformedData);
			default:
				localResponse = {
					error: 'Invalid action'
				};
		}
		if (localResponse.error) {
			console.error('Error executing payload:', localResponse.error);
			return { error: localResponse.error };
		}
		const { data: localHistoryResponse, error } = await appState.db.insert(
			'modification_history',
			payload
		);
		console.log('localHistoryResponse', localHistoryResponse);
		return { error };
	}

	async encrypt(data) {
		for (const column of Object.keys(data)) {
			console.log('column', column);
			console.log('data[column]', data[column]);
			if (
				typeof data[column] === 'boolean' ||
				typeof data[column] === 'object' ||
				Array.isArray(data[column])
			) {
				data[column] = await invoke('encrypt_string', {
					input: JSON.stringify(data[column]),
					userId: appState.user.id
				});
			} else if (typeof data[column == 'string']) {
				data[column] = await invoke('encrypt_string', {
					input: data[column],
					userId: appState.user.id
				});
			} else {
				data[column] = null;
			}
		}
		data.user_id = appState.user.id;
		return data;
	}

	async decrypt(data) {
		if (data) {
			for (const column of Object.keys(data)) {
				data[column] = await invoke('decrypt_string', {
					encrypted: data[column]
				});
			}
		}
		return data;
	}

	async buildAndTreatHistory(table, action, data) {
		console.log('buildAndTreatHistory', table, action, data);
		const task = {
			table,
			action,
			date: new Date(),
			promesse: () => this.sendToRemoteDB(table, action, data)
		};
		console.log('task', task);

		return this.promiseQueue.add(task);
	}
}
