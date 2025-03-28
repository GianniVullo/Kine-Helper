<script>
	let {
		id,
		name,
		// placeholder,
		error,
		// help,
		multiple,
		files = $bindable(),
		oninput,
		constraints
	} = $props();

	function ondrop(ev) {
		console.log('File(s) dropped', files);

		// Prevent default behavior (Prevent file from being opened)
		ev.preventDefault();
		changeStylesOnDragLeave();
		console.log(ev.dataTransfer);

		if (ev.dataTransfer.files) {
			files = ev.dataTransfer.files;
		}
	}
	function ondragover(ev) {
		console.log('File(s) in drop zone');
		ev.preventDefault();
		changeStylesOnDragOver();
	}
	function ondragleave(ev) {
		console.log('File(s) leaves drop zone');
		ev.preventDefault();
		changeStylesOnDragLeave();
	}

	function changeStylesOnDragOver() {
		const dropZone = document.getElementById('drop_zone');
		const label1 = document.querySelector('#label-1');
		const label2 = document.querySelector('#label-2');

		label1.innerHTML = 'Relâcher pour sélectionner ce(s) fichier(s)';
		label2.innerHTML = '';
		dropZone.classList.add('border-purple-500');
		dropZone.classList.add('bg-purple-500/20');
		dropZone.classList.remove('border-dashed');
	}
	function changeStylesOnDragLeave(node) {
		const dropZone = document.getElementById('drop_zone');
		const label1 = document.querySelector('#label-1');
		const label2 = document.querySelector('#label-2');

		label1.innerHTML = 'Téléchargez un fichier';
		label2.innerHTML = 'ou glissez-déposez un fichier';
		dropZone.classList.remove('border-purple-500');
		dropZone.classList.remove('bg-purple-500/20');
		dropZone.classList.add('border-dashed');
	}
</script>

<div
	id="drop_zone"
	role="region"
	class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
	{ondrop}
	{ondragover}
	{ondragleave}
>
	<div class="text-center">
		<svg
			class="mx-auto size-12 text-gray-300"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			data-slot="icon"
		>
			<path
				fill-rule="evenodd"
				d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
				clip-rule="evenodd"
			/>
		</svg>
		<div class="mt-4 flex text-sm/6 text-gray-600">
			<label
				for={id}
				class="relative cursor-pointer rounded-md font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 {error
					? 'text-red-900 focus-within:ring-red-500 hover:text-error-700'
					: 'text-indigo-600 focus-within:ring-indigo-600  hover:text-indigo-500'}"
			>
				<span id="label-1">Téléchargez un fichier</span>
				<input {id} {name} type="file" {multiple} bind:files {oninput} class="sr-only" />
			</label>
			<p id="label-2" class="pl-1">ou glissez-déposez un fichier</p>
		</div>
		{#if constraints}
			<!-- TODO: define real constraints here  -->
			<p class="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
		{/if}
		{#if files && files.length > 0}
			<div class="mt-1 flex flex-col items-center">
				{#each files as file}
					<p class="text-xs/5 text-gray-600">{file.name}</p>
				{/each}
			</div>
		{/if}
	</div>
</div>
{#if error}
	<p class="mt-2 space-y-1 text-sm text-red-600" id={`${name}-error`}>{error}</p>
{/if}
