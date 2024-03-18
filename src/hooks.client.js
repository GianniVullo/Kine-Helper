import { supabase } from './lib/stores/supabaseClient';

export async function handleError({ error, event, status, message }) {
    const errorId = crypto.randomUUID();
    await supabase.from('unexpected_errors').insert({erreur: { error, event, status, message }});

	return {
		message: 'Whoops!',
		errorId
	};
}
