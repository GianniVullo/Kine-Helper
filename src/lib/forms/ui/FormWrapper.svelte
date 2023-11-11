<script>
	import { pristine } from '../actions/pristine';

	let clazz = '';
	export { clazz as class };
	export let formSchema;
</script>

<form
	novalidate
	class={clazz ? clazz : 'group/form flex flex-col space-y-2 px-4'}
	use:pristine={formSchema}>
	<slot />
</form>
