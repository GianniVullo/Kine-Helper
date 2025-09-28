export { default as LoginForm } from './components/forms/LoginForm.svelte';
export { user } from './stores/UserStore';
export { supabase } from './stores/supabaseClient';
export { AnnexeA } from './pdfs/annexeA';

// export {default as SignUpForm } from './forms/authentication/SignUpForm.svelte'
// export {default as SignUpForm } from './forms/authentication/SignUpForm.svelte'

export const USER = 0;
export const PATIENT = 1;
export const SITUATION_PATHOLOGIQUE = 2;
export const PRESCRIPTION = 3;
export const SEANCE = 4;
export const ACCORD = 5;
export const ATTESTATION = 6;
export const FACTURE = 7;
export const SETTINGS = 8;
