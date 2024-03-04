<script>
    import { ProgressRadial } from "@skeletonlabs/skeleton";
	import { t } from "../../i18n";
    let clazz = '';
    export { clazz as class }

</script>
<button class="variant-filled-primary btn self-center justify-self-center {clazz}" type="submit">
		<slot>
            {$t('shared', 'save')}
        </slot>
		<ProgressRadial
			width="w-6 ml-2 group-[.isLoading]/form:block hidden"
			meter="stroke-secondary-500"
			track="stroke-tertiary-500/30" />
	</button>
