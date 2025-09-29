<script>
	import { invoke } from '@tauri-apps/api/core';
	import FineTuningRawPrinterForm from '../../../lib/components/forms/FineTuningRawPrinterForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<button
	onclick={async () => {
		let document_bytes = await invoke('test_document_generation');

		// Convert array of integers (bytes) to ASCII string
		const asciiString = String.fromCharCode(...document_bytes);

		console.log('Raw bytes:', document_bytes);
		console.log('ASCII string:', asciiString);
		document.getElementById('textReceiver').textContent = asciiString;

		// Alternative method if the array is very large (to avoid stack overflow)
		// const asciiString = document_bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');

		// If you need to handle UTF-8 encoding instead of ASCII
		// const decoder = new TextDecoder('utf-8');
		// const utf8String = decoder.decode(new Uint8Array(document_bytes));
		// console.log('UTF-8 string:', utf8String);
	}}
	class="bg-blue-500">TEST</button>

<div id="textReceiver"></div>

<FineTuningRawPrinterForm />