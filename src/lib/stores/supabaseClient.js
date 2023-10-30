import { createClient } from '@supabase/supabase-js'

export const supabase = createClient("https://epzrdxofotzufykimwuc.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwenJkeG9mb3R6dWZ5a2ltd3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE4Mjg4MzQsImV4cCI6MjAwNzQwNDgzNH0.V_N0maXkqeEneoWSKVv0qj1cZbmSpHIRqBP0EUZnSgk")

export async function selectPatients(user) {
        return await supabase
			.from('patients')
			.select(
				`
            patient_id,
            created_at,
            nom,
            prenom,
            niss,
            adresse,
            cp,
            localite,
            date_naissance,
            tel,
            gsm,
            email,
            sexe,
            mutualite,
            num_affilie,
            tiers_payant,
            ticket_moderateur,
            bim,
            actif,
            numero_etablissment,
            service,
            situation_pathologiques (
                sp_id,
                created_at,
                patient_id,
                numero_etablissment,
                service,
                groupe,
                duree,
                lieu,
                drainage,
                motif,
                plan_du_ttt,
                seconde_autorisee,
                consultation_demandee,
                deja_faites,
                seance_per_week,
                n_seances,
                day_of_week,
                seances (
                    sp_id,
                    seance_id,
                    patient_id,
                    created_at,
                    code_id,
                    start,
                    end,
                    description,
                    has_been_attested,
                    attestation_id,
                    prescription_id
                ),
                prescriptions (
                    sp_id,
                    patient_id,
                    prescription_id,
                    prescripteur,
                    created_at,
                    file_path,
                    date,
                    active,
                    jointe_a
                ),
                attestations (
                    sp_id,
                    patient_id,
                    attestation_id,
                    prescription_id,
                    created_at,
                    date,
                    porte_prescr,
                    numero_etablissment,
                    service,
                    has_been_printed,
                    total_recu,
                    valeur_totale,
                    with_indemnity,
                    with_intake
                )
            )`
			)
			.eq('kinesitherapeute_id', user.id);
}