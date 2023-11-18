<script>
    export let done;
    export let titre;
    export let titreDone;
    export let description;
</script>

<h3
	class:!text-success-600={done}
	class:dark:!text-success-400={done}
	class="cursor-default select-none text-xl text-tertiary-600 dark:text-tertiary-400">
	{done ? titreDone : titre}
</h3>
<p class="cursor-default select-none dark:text-surface-400">
	{description}
</p>
