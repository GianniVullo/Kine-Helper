<script>
	let clazz = '';
	export { clazz as class };
</script>

<!--? La classe CSS form-group permet à Pristine.js de trouver où mettre les classes has-error et success ainsi que le errorMessage -->
<div class="form-group group/field space-y-2 {clazz}">
	<slot />
</div>
