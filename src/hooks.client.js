import { error as errorLog } from "@tauri-apps/plugin-log";

export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID(); 
	errorLog("Unexpected: " + error)
	console.log(error, event, status, message);

	// await supabase.from('unexpected_errors').insert({erreur: { error, event, status, message }});

	return {
		message: 'Whoops!',
		errorId
	};
}
