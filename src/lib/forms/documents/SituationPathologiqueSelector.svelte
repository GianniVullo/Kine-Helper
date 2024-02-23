<script>
	export let aOrB;
	let annexeAOptions = {
		'a) Affections posttraumatiques ou postopératoires :': [
			{
				value: 0,
				label:
					"- situations dans lesquelles une ou plusieurs prestations de l'article 14, k) (orthopédie), I (prestations chirurgicales) et III (arthroscopies diagnostiques et thérapeutiques), sont attestées et pour lesquelles la prestation ou la somme de ces prestations correspond à une valeur de N200 ou plus;"
			},
			{
				value: 1,
				label:
					"- situations dans lesquelles une prestation de l'article 14, b) (neurochirurgie) est attestée et pour laquelle la prestation correspond à une valeur de K225 ou plus;"
			},
			{
				value: 2,
				label:
					'- en cas de lésions de la main, situations dans lesquelles une ou plusieurs prestations de l’article 14, k) (orthopédie) I (prestations chirurgicales) d’une valeur totale de Nx et une prestation de l’article 14, b) (neurochirurgie) d’une valeur de Ky sont effectuées conjointement lorsque le résultat du calcul suivant [Nx/N200 + Ky/225] est supérieur ou égal à 1;'
			},
			{
				value: 3,
				label:
					"- situations dans lesquelles une des prestations 227695–227706, 227710–227721, 227813-227824, 227835– 227846, 226936-226940, 227592–227603, 227614–227625, 227651-227662, 227673-227684, 227776-227780 ou 227791-227802 de l'article 14, e) de la nomenclature est attestée."
			},
			{
				value: 4,
				label:
					"- situations dans lesquelles une prestation de l'article 14, n) (chirurgie orthopédique et neurochirurgie est attestée et pour lesquelles la prestation correspond à une valeur de K225 ou plus"
			}
		],
		'b) Situations  dans  lesquelles  une  des  prestations  211046,  212225  ou  214045  (article 13, § 1er de la nomenclature (réanimation)) à été attestée.':
			{
				value: 5
			},
		'c) Bénéficiaires après une admission en fonction de soins intensifs (code 490), dans une fonction de soins néonatals locaux (fonction N°)  (code 190) ou  un service de néonatalgie intensive (NIC) (code 270).':
			{
				value: 6
			},
		"d) Insuffisance respiratoire pour les enfants de moins de 16 ans souffrant de trachéo-, laryngo- ou bronchomalacie ou d'infections récidivantes des voies respiratoires inférieures.":
			{
				value: 7
			},
		'e) Déficit moteur et invalidité à la suite :': [
			{
				value: 8,
				label: '- d’une mononeuropathie (par exemple pied tombant ou main tombante)'
			},
			{
				value: 9,
				label: '- d’une polyneuropathie motrice ou mixte'
			},
			{
				value: 10,
				label:
					'- d’une myopathie induite par médication ou par contact aigu ou chronique avec des substances toxiques.'
			}
		],
		'<div class="mb-2">f) Situations dans le domaine de l’orthopédie</div><ul class="pl-4 space-y-1"><li>– traumatologie</li><li>- fracture vertébrale qui a nécessité une immobilisation par plâtre, corset ou orthèse d\'au moins trois semaines; </li><li>- fracture du bassin qui nécessite une immobilisation ou une décharge totale ou partielle d\'au moins trois semaines; </li><li>- fracture  de  la  rotule,  du  plateau tibial, de  la  tête  humérale,  du coude ou  fracture  intra-articulaire  à  la  hauteur des  membres,  qui  ont  nécessité une immobilisation  d\'au  moins trois semaines; </li><li>- luxation  du coude, de la hanche,  de la prothèse  de hanche ou  de  l’articulation de l\'épaule ou de la prothèse de l’épaule ; </li><li>- entorse grave du genou avec rupture totale ou partielle d’un ou de plusieurs ligaments ;</li></ul>':
			{
				value: 11
			},
		'g) Capsulite rétractile (frozen shoulder)': {
			value: 12
		},
		'h) Situations nécessitant une rééducation uro-, gynéco-, colo- ou proctologique': [
			{ value: 13, label: '- Neuropathie avérée, tant chez les femmes que chez les hommes;' },
			{
				value: 14,
				label: `<h5 class=\"mb-2\">Rééducation postopératoire du dysfonctionnement sphinctérien après :<h5>   
            <ul class=\"pl-4 space-y-1\"><li>(01) Prostatectomie radicale ou adénomectomie</li>
            <li>(02) Cystectomie  totale  avec  entéro-cystoplastie  chez  des  patients  présentant 
            une incontinence urinaire et/ou un déficit de sensibilité de réplétion vésicale.</li> 
            <li>(03) Amputation  d'une  partie  du  système  digestif  avec  maintien  du  sphincter 
            anal.</li>
            <li>(04) Prolapsus vésical, rectal ou utérin après intervention chirurgicale.</li></ul>`
			},
			{
				value: 15,
				label: `<div class=\"mb-2\">Pathologies fonctionnelles pour les enfants jusqu’au 16ème anniversaire dues à des dysfonctionnements ou des malformations :</div> 
            <ul class=\"pl-4 space-y-1\"><li>(01)  infections  urinaires  pouvant  constituer  une  menace  pour  le  haut  appareil 
            urinaire à court et moyen termes :</li><ul class=\"pl-8\"> 
                <li>- dyssynergie vésico-sphinctérienne</li>
                <li>- infections urinaires à répétition</li>
                <li>- syndrome des valves urétrales post-opératoire</li>
                <li>- immaturité vésicale</li></ul>
            <li>(02) encoprésie chez l’enfant</li></ul>`
			}
		],
		'i) Syndrome Douloureux Régional Complexe (SDRC) de type I (algoneurodystrophie ou maladie de Südeck) ou de type II (causalgie) ':
			{
				value: 16
			},
		'j) Polytraumatismes, avec des répercussions fonctionnelles invalidantes au niveau de deux membres différents ou au niveau d’un membre et du tronc, dont au moins 2 traumatismes  répondent  aux  critères  des  situations  pathologiques  définies  au  §14, 5°, A, a), 1) ou 2) (affections posttraumatiques ou postopératoires) et/ou au §14, 5°, A., f) (situations dans le domaine de l’orthopédie – traumatologie)':
			{
				value: 17
			},
		'<div class="mb-2">k) Situations dans le domaine de la stomatologie énumérées ci-dessous :</div><ul class ="space-y-1 pl-4"><li>- après une intervention chirurgicale temporomandibulaire intra-articulaire ;</li><li>- pendant et/ou après une radiothérapie concernant la région maxillo-faciale ;</li><li>- après une fracture mandibulaire intra-articulaire ou sub-condylaire.</li></ul>':
			{
				value: 18
			}
	};
	let annexeBOptions = {
		'a) Situations qui nécessitent une rééducation fonctionnelle de la marche pour les  bénéficiaires  à  partir  leur  65ème  anniversaire  ayant  déjà  été  victime  d’une  chute  et présentant un risque de récidive, à objectiver par le médecin traitant et le kinésithérapeute au moyen: <br>&nbsp&nbsp&nbsp&nbsp1) du test « Timed up & go », avec un score supérieur à 20 secondes ;<br>&nbsp&nbsp&nbsp&nbsp2) du résultat positif à au moins un des deux tests suivants, ceux-ci devant tous deux être effectués:<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp(01) - le test « Tinetti », avec un score inférieur à 20/28 ;<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp(02) - le  test « Timed chair stands », avec un score supérieur à 14 secondes.':
			{
				value: 0
			},
		'b) Troubles du développement psychomoteur<br><br>Chez les enfants de moins de 16 ans, après avis et proposition de traitement d’un des médecins spécialistes  mentionnés  ci-dessous,  et  avec  un  score  significativement  plus  faible  sur  un  test standardisé;<br><br>&nbsp&nbsp&nbsp&nbspMédecin spécialiste en :<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- (neuro)pédiatrie<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- (neuro)pédiatrie et F et P (*) <br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- neuropsychiatrie et F et P (*) <br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- neurologie<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- neurologie et F et P* <br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- psychiatrie <br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- psychiatrie et F et P*<br><br>Chez  les  enfants  de  moins  de  19  mois,  l’avis,  la  proposition  de  traitement  et  le  score significativement  plus  faible  mentionnés  ci-dessus  peuvent  être  remplacés  par  la  constatation  de troubles manifestes cliniques du développement sur base d\'une évaluation effectuée par une équipe multidisciplinaire spécialisée, qui compte au moins un (neuro pédiatre.<br><br><span class"text-sm">*F et P = spécialiste en réadaptation fonctionnelle et professionnelle des handicapés.</span>':
			{
				value: 1
			},
		"c) Insuffisance respiratoire chez les bénéficiaires qui sont suivis dans le cadre de la convention-type de rééducation fonctionnelle relative à l'oxygénothérapie de longue durée à domicile ou en cas de respiration artificielle à domicile. ":
			{
				value: 2
			},
		'd) Polyneuropathie chronique motrice ou mixte .': {
			value: 3
		},
		'e) Syndrome de fatigue chronique<br>répondant aux conditions prévues dans la nomenclature.': {
			value: 4
		},
		'f) Syndrome fibromyalgique<br><br>Le  diagnostic  doit  être  confirmé  par  un  médecin  spécialiste  en  rhumatologie  ou  en  médecine physique et réadaptation sur base d’un examen clinique comprenant les critères de diagnostic de l’ACR (American College of Rheumatology). Cette confirmation signée par le médecin spécialiste doit figurer dans le dossier individuel kinésithérapeutique et préciser que les critères de diagnostic utilisés sont bien ceux de l’ACR.<br><br>Avant la fin de chaque année civile qui suit l’année au cours de laquelle la 1ère prestation du traitement  a  eu  lieu,  le  médecin  spécialiste  susmentionné  réévaluera  l’évolution  de  la symptomatologie  du  patient  afin  de  confirmer  la  nécessité  de  poursuivre  le  traitement  dans  le cadre  du  §14.  Cette  confirmation  signée  par  le  médecin  spécialiste  doit  figurer  dans  le  dossier individuel kinésithérapeutique. ':
			{
				value: 5
			},
		'g) Dystonie cervicale primaire<br> démontrée par un rapport diagnostique établi par un médecin-spécialiste en neurologie':
			{
				value: 6
			},
		'h) lymphoedème<br> répondant aux conditions prévues dans la nomenclature.': { value: 7 }
	};
	export let value;
</script>

<h5 class="my-2 select-none text-surface-500 dark:text-surface-300">Veuillez choisir une situation pathologique</h5>
{#each Object.entries(aOrB === 'A' ? annexeAOptions : annexeBOptions) as item}
	<div class="flex">
		{#if Array.isArray(item[1])}
			<div class="mb-4 flex flex-col space-y-4">
				<h5>{item[0]}</h5>
				<div class="flex flex-col space-y-4 pl-5 pr-10">
					{#each item[1] as subItem, idx}
						<label
							class:!text-sm={value && value !== subItem.value}
							class="has-[:checked]:border-2 has-[:checked]:text-surface-100 has-[:checked]:bg-surface-700 has-[:checked]:text-lg has-[:checked]:border-secondary-400 flex cursor-pointer rounded-lg border px-2 py-2 text-surface-300 duration-200 dark:border-surface-400 dark:hover:bg-surface-800"
							for={item[0].substring(0, 2) + idx.toString()}>
							<input
								class="invisible"
								type="radio"
								bind:group={value}
								value={subItem.value}
								name="situation_pathologique"
								id={item[0].substring(0, 2) + idx.toString()} />
							<div>{@html subItem.label}</div>
						</label>
					{/each}
				</div>
			</div>
		{:else}
			<label
				for={item[0].substring(0, 2)}
				class="has-[:checked]:border-2 has-[:checked]:text-surface-100 has-[:checked]:bg-surface-700 has-[:checked]:text-lg has-[:checked]:!border-secondary-400 mb-4 flex cursor-pointer rounded-lg border px-2 py-2 pl-5 pr-10 text-surface-300 duration-200 dark:border-surface-400 dark:hover:bg-surface-800">
				<div>{@html item[0]}</div>
				<input
					class="invisible"
					type="radio"
					value={item[1].value}
					bind:group={value}
					name="situation_pathologique"
					id={item[0].substring(0, 2)} /></label>
		{/if}
	</div>
{/each}

<style>
	input[type='radio'] {
		/* Add if not using autoprefixer */
		-webkit-appearance: none;
		appearance: none;
		/* For iOS < 15 to remove gradient background */
		background-color: #fff;
		/* Not removed via appearance */
		margin: 0;
	}
</style>
