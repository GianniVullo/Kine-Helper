<script>
	import { pristine } from './actions/pristine';

	let clazz = '';
	export { clazz as class };
	export let formSchema;
</script>

<form
	novalidate
	class={clazz ? clazz : 'group/form flex flex-col space-y-2 px-4'}
	use:pristine={formSchema}>
	<h1 class="px-4 pt-4 text-2xl text-surface-400"><slot name="title" /></h1>
	<slot />
</form>
