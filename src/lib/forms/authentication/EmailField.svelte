<script>
	import { DefaultFieldWrapper } from '../index';
	import { t } from '../../i18n';

	export let value = undefined;
</script>

<DefaultFieldWrapper>
	<p>{$t('login', 'controls.email')}</p>
	<div
		class="input-group input-group-divider grid-cols-[auto_1fr_auto] group-[.has-error]/field:border-error-500">
		<div class="input-group-shim">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-6 w-6 group-[.success]/field:stroke-emerald-600 group-[.has-error]/field:stroke-error-500">
				<path
					stroke-linecap="round"
					d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
			</svg>
		</div>
		<input
			id="email"
			type="email"
			required
			name="email"
			bind:value={value}
			class="input group-[.has-error]/field:border-error-500"
			data-pristine-email-message="Veuillez entrer un email valide"
			data-pristine-required-message="Ce champ est requis" />
	</div>
</DefaultFieldWrapper>
