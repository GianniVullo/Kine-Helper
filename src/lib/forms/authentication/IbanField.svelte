<script>
	import {TextField} from '../index';

	let previousLength = 0;
	export let value = null;
	function ibanHandler(event) {
		let value = event.target.value;

		if (event.target.value.length > previousLength) {
			if (value.length == 4) {
				event.target.value = value.toUpperCase() + ' ';
			}
			if (value.length == 9) {
				event.target.value = value += ' ';
			}
			if (value.length == 14) {
				event.target.value = value += ' ';
			}
			if (!value.startsWith('BE')) {
				if (value.length == 19) {
					event.target.value = value += ' ';
				}
				if (value.length == 24) {
					event.target.value = value += ' ';
				}
				if (value.length > 27) {
					event.target.value = value.substring(0, 27);
				}
			} else {
				if (value.length > 19) {
					event.target.value = value.substring(0, 19);
				}
			}
		}
		previousLength = event.target.value.length - 1;
	}
</script>

<TextField
	placeholder="IBAN : BEXX XXXX XXXX XXXX"
	label="N° de compte bancaire"
    autocomplete="off"
	name="iban"
	{value}
	required
	pattern={/\b[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{0,2})?$\b|\bBE[0-9]{2}(?:[ ]?[0-9]{4}){3}\b/}
	patternMessage="Veuillez insérer 'BE' suivis de 14 chiffres"
	onChangeHandler={ibanHandler} />
