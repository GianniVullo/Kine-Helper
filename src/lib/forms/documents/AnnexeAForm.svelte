<script>
	import { FormWrapper, SubmitButton, DateField, RadioFieldV2 } from '../index';
    import DBAdapter from '../actions/dbAdapter';

	let message = '';

    export let patient;
    export let sp
	let situationPathologique;
	let date;
	let options = [
		"- situations dans lesquelles une ou plusieurs prestations de l'article 14, k) (orthopédie), I (prestations chirurgicales) et III (arthroscopies diagnostiques et thérapeutiques), sont attestées et pour lesquelles la prestation ou la somme de ces prestations correspond à une valeur de N200 ou plus;",
		"- situations dans lesquelles une prestation de l'article 14, b) (neurochirurgie) est attestée et pour laquelle la prestation correspond à une valeur de K225 ou plus;",
		'- en cas de lésions de la main, situations dans lesquelles une ou plusieurs prestations de l’article 14, k) (orthopédie) I (prestations chirurgicales) d’une valeur totale de Nx et une prestation de l’article 14, b) (neurochirurgie) d’une valeur de Ky sont effectuées conjointement lorsque le résultat du calcul suivant [Nx/N200 + Ky/225] est supérieur ou égal à 1;',
		"- situations dans lesquelles une des prestations 227695–227706, 227710–227721, 227813-227824, 227835– 227846, 226936-226940, 227592–227603, 227614–227625, 227651-227662, 227673-227684, 227776-227780 ou 227791-227802 de l'article 14, e) de la nomenclature est attestée.",
		"- situations dans lesquelles une prestation de l'article 14, n) (chirurgie orthopédique et neurochirurgie est attestée et pour lesquelles la prestation correspond à une valeur de K225 ou plus",
		'Situations dans lesquelles les prestations 211046, 212225 ou 214045 (article 13, § 1er de la nomenclature (réanimation) a été attestée.',
		'Bénéficiaires après une admission en fonction de soins intensifs (code 490), dans une fonction de soins néonatals locaux (fonction N°) (code 190) ou un service de néonatalgie intensive (NIC) (code 270).',
		"Insuffisance respiratoire pour les enfants de moins de 16 ans souffrant de trachéo-, laryngo- ou bronchomalacie ou d'infections récidivantes des voies respiratoires inférieures.",
		"- d'une mononeuropathie (par exemple pied tombant ou main tombante);",
		"- d'une polyneuropathie motrice ou mixte;",
		"- d'une myopathie induite par médication ou par contact aigu ou chronique avec des substances toxiques.",
		"Situations dans le domaine de l'orthopédie – traumatologie 10 - fracture vertébrale qui a nécessité une immobilisation par plâtre, corset ou orthèse d'au moins trois semaines; - fracture du bassin qui nécessite une immobilisation ou une décharge totale ou partielle d'au moins trois semaines; - fracture de la rotule, du plateau tibial, de la tête humérale, du coude ou fracture intra-articulaire à la hauteur des membres, qui ont nécessité une immobilisation d'au moins trois semaines; - luxation du coude, de la hanche, de la prothèse de hanche ou de l'articulation de l'épaule ou de la prothèse de l'épaule; - entorse grave du genou avec rupture totale ou partielle d'un ou de plusieurs ligaments.",
		'Capsulite rétractile (frozen shoulder).',
		'- Neuropathie avérée, tant chez les femmes que chez les hommes;',
		"- Rééducation postopératoire du dysfonctionnement sphinctérien après: (01) Prostatectomie radicale ou adénomectomie (02) Cystectomie totale avec entéro-cystoplastie chez des patients présentant une incontinence urinaire et/ou un déficit de sensibilité de réplétion vésicale. (03) Amputation d'une partie du système digestif avec maintien du sphincter anal. (04) Prolapsus vésical, rectal ou utérin après intervention chirurgicale;",
		"- Pathologies fonctionnelles pour les enfants jusqu'au 16ème anniversaire dues à des dysfonctionnements ou des malformations: (01) infections urinaires pouvant constituer une menace pour le haut appareil urinaire à court et moyen termes: - dyssynergie vésico-sphinctérienne - infections urinaires à répétition - syndrome des valves urétrales post-opératoire - immaturité vésicale (2) encoprésie chez l’enfant.",
		'Syndrome Douloureux Régional Complexe (SDRC) de type I (algoneurodystrophie ou maladie de Südeck) ou de type II (causalgie).',
		'Polytraumatismes, avec des répercussions fonctionnelles invalidantes au niveau de deux membre différents ou au niveau d’un membre et du tronc, dont au moins 2 traumatismes répondent aux critères des situations pathologiques définies au § 14, 5°, A, a), 1) ou 2) (affections posttraumatiques ou postopératoires) et/ou au § 14, 5°, A, f) (situations dans le domaine de l’orthopédie - traumatologie).',
		'Situations dans le domaine de la stomatologie énumérées ci-dessous : - après une intervention chirurgicale temporomandibulaire intra-articulaire; - pendant et/ou après une radiothérapie concernant la région maxillo-faciale - après une fracture mandibulaire intra-articulaire ou sub-condylaire.'
	].map((label, index) => ({ label, value: index }));

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
        let db = new DBAdapter();
        await db.save('documents', {
            patient_id: patient.patient_id,
            sp_id: sp.sp_id,
            date: date,
            type: 'annexe_a',
            situation_pathologique: situationPathologique
        });
        submitter.disabled = false;
	}
</script>

<FormWrapper {formSchema}>
	<!--* Fields here -->
	<DateField bind:value={date} label="Date de la première séance" required />
	<RadioFieldV2
		bind:value={situationPathologique}
		label="Situation pathologique"
		name="docType"
		required
		{options} />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
