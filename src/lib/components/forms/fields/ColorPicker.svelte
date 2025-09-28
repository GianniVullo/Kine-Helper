<script lang="ts">
	let { name = 'color', value = $bindable(), onchange } = $props();

	let legend = 'Choose a label color';

	const sidebarSeeds = {
		indigo: {
			'50': 'oklch(96.2% 0.018 272.314)',
			'100': 'oklch(93% 0.034 272.788)',
			'200': 'oklch(87% 0.065 274.039)',
			'300': 'oklch(78.5% 0.115 274.713)',
			'400': 'oklch(67.3% 0.182 276.935)',
			'500': 'oklch(58.5% 0.233 277.117)',
			'600': 'oklch(51.1% 0.262 276.966)',
			'700': 'oklch(45.7% 0.24 277.023)',
			'800': 'oklch(39.8% 0.195 277.366)',
			'900': 'oklch(35.9% 0.144 278.697)'
		},
		blue: {
			'50': '#F5F7FA',
			'100': '#EAF0F5',
			'200': '#CDDBEA',
			'300': '#ADC4DC',
			'400': '#86A8CB',
			'500': '#628FBC',
			'600': '#497AAB',
			'700': '#3D668F',
			'800': '#315272',
			'900': '#293D51'
		},
		orange: {
			'50': '#FDF6F2',
			'100': '#FBEDE4',
			'200': '#F8D4BF',
			'300': '#F3B896',
			'400': '#ED9563',
			'500': '#E87635',
			'600': '#DC6019',
			'700': '#B75015',
			'800': '#934011',
			'900': '#6A3111'
		},
		green: {
			'50': '#F4FBF5',
			'100': '#E8F7EB',
			'200': '#C8EFCE',
			'300': '#A4E5AF',
			'400': '#79D889',
			'500': '#55CC67',
			'600': '#3FB456',
			'700': '#349649',
			'800': '#2A793C',
			'900': '#245733'
		},
		yellow: {
			'50': '#FBFAF2',
			'100': '#F7F4E4',
			'200': '#EBE3BE',
			'300': '#DDCF95',
			'400': '#CAB965',
			'500': '#B7A438',
			'600': '#9C8A1C',
			'700': '#827317',
			'800': '#695C13',
			'900': '#4C430F'
		},
		cyan: {
			'50': '#F2FAFD',
			'100': '#E4F4FB',
			'200': '#BFE6F8',
			'300': '#96D3F3',
			'400': '#63BBED',
			'500': '#35A6E8',
			'600': '#1989DC',
			'700': '#156FB7',
			'800': '#115993',
			'900': '#11416A'
		},
		magenta: {
			'50': '#FBF2F6',
			'100': '#F7E6EE',
			'200': '#E9C1D5',
			'300': '#DA98B8',
			'400': '#C96995',
			'500': '#BA4578',
			'600': '#A92A5C',
			'700': '#8D234D',
			'800': '#711C3E',
			'900': '#511A2F'
		},
		gray: {
			'50': '#FBFBFB',
			'100': '#F6F6F6',
			'200': '#E6E6E6',
			'300': '#D4D4D4',
			'400': '#BBBBBB',
			'500': '#A5A5A5',
			'600': '#8C8C8C',
			'700': '#747474',
			'800': '#5C5C5C',
			'900': '#444444'
		},
		mint: {
			'50': '#F2FBFA',
			'100': '#E4F7F4',
			'200': '#BFEFE7',
			'300': '#97E5D8',
			'400': '#65D8C5',
			'500': '#38CCB4',
			'600': '#1BB49B',
			'700': '#179682',
			'800': '#137969',
			'900': '#10574C'
		},
		lime: {
			'50': '#F7FBF2',
			'100': '#EFF7E4',
			'200': '#D7EEBE',
			'300': '#BDE595',
			'400': '#9DD865',
			'500': '#83CC38',
			'600': '#6EB41C',
			'700': '#5C9617',
			'800': '#4B7913',
			'900': '#38540F'
		},
		purple: {
			'50': '#F8F4F8',
			'100': '#F0E8F0',
			'200': '#DCC6DE',
			'300': '#C5A4C7',
			'400': '#A979AD',
			'500': '#915690',
			'600': '#7B3D7B',
			'700': '#673368',
			'800': '#512A52',
			'900': '#3A263A'
		},
		salmon: {
			'50': '#FDF3F1',
			'100': '#FCE6E4',
			'200': '#F9C4BE',
			'300': '#F59E94',
			'400': '#F06F60',
			'500': '#EC4532',
			'600': '#E02A15',
			'700': '#BB2311',
			'800': '#951C0E',
			'900': '#6C180F'
		}
	};

	const options = Object.entries(sidebarSeeds).map(([key, declination]) => ({
		name: key,
		value: JSON.stringify(declination),
		color: declination['500']
	}));
</script>

<fieldset>
	<legend class="block text-sm/6 font-semibold text-gray-900 dark:text-white">
		{legend}
	</legend>

	<div class="space-x-2e mt-6 flex flex-wrap items-center gap-x-3">
		{#each options as opt}
			<div class="flex rounded-full outline -outline-offset-1 outline-black/10">
				<input
					type="radio"
					{onchange}
					{name}
					value={opt.value}
					aria-label={opt.name}
					style:background-color={opt.color}
					style:outline={opt.color}
					class={`size-8 appearance-none rounded-full forced-color-adjust-none
                  checked:outline-2 checked:outline-offset-2
                  focus-visible:outline-3 focus-visible:outline-offset-3`}
					bind:group={value} />
			</div>
		{/each}
	</div>
</fieldset>
