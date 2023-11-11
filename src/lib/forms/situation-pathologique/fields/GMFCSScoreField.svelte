<script>
	import {RadioField} from '../../index';

	let options = [
		{ value: 1, label: 'Niveau 1 : Marche sans restriction des mouvements' },
		{ value: 2, label: 'Niveau 2 : Marche avec restriction des mouvements' },
		{ value: 3, label: 'Niveau 3 : Marche avec aide technique à la marche' },
		{
			value: 4,
			label:
				'Niveau 4 : Mobilité autonome avec restriction des mouvements ; peut utiliser une aide motorisée.'
		},
		{ value: 5, label: 'Niveau 5 : Déplacement en fauteuil roulant manuel, poussé par un adulte.' }
	];
  //   FormFieldStyleinterface messages() {
  //   switch (pathoVariator) {
  //     case 2:
  //       return FormFieldStyleinterface(
  //           title:
  //               'Attention, si le patient est dans sa 21eme années il faut envoyer une notification au medecin conseil avec le GMFCS du patient.\nA compter de l\'année de ses 22 ans le score GMFCS déterminera le nombre de séances auquels le patient aura droit\n4 ou 5 : 200 séances, 2 ou 3 : 150 séances, 1 : 100 séances\nUne demande pour 50 séances justifiées supplémentaires pourra être introduite auprès du médecin conseil\nNe peuvent pas être cumulée avec une seconde séance par jour.',
  //           styleType: StyleType.text);
  //     case 3:
  //       return FormFieldStyleinterface(
  //           title:
  //               'Ne peuvent pas être cumulée avec une seconde séance par jour.',
  //           styleType: StyleType.text);
  //     case 4:
  //       return FormFieldStyleinterface(
  //           title:
  //               'Ne peuvent pas être cumulée avec une seconde séance par jour.',
  //           styleType: StyleType.text);
  //     case 5:
  //       return FormFieldStyleinterface(
  //           title:
  //               'La nécessité d\'effectuer des séances de 45 minutes doit être mentionné sur la prescription émise par un médecin porteur de la qualification de médecin spécialiste en médecine physique et revalidation et/ou porteur de la qualification de spécialiste en réadaptation fonctionnelle et professionnelle pour handicapés.\nNe peuvent pas être cumulée avec une seconde séance par jour.',
  //           styleType: StyleType.text);
  //     case 6:
  //       return FormFieldStyleinterface(
  //           title:
  //               '30 fois par années civiles maximums avec un maximum de 10 séances effectuées par prescription\nDoivent être séparées de 3h au moins\nNe peuvent pas être cumulée avec une seconde séance par jour.',
  //           styleType: StyleType.text);
  //     default:
  //       return FormFieldStyleinterface(
  //           formElement: const SizedBox(), styleType: StyleType.autre);
  //   }
  // }


</script>

<RadioField name="gmfcs" {options} label="Score GMFCS" />
