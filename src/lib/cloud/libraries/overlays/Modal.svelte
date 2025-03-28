<script>
	import { modalStore } from "./modalUtilities.svelte";
	import { page } from "$app/state";
	import { warningIcon, warningOutlineIcon } from "$lib/ui/svgs/IconSnippets.svelte";
	import BugReportModal from "$lib/ui/BugReportModal.svelte";
	import FactureCreationModal from "$lib/ui/FactureCreationModal.svelte";
	import DocumentSelectionModal from "$lib/ui/DocumentSelectionModal.svelte";
	import CalendarEventModal from "$lib/ui/CalendarEventModal.svelte";
	import MultipleEventSelectionModal from "$lib/ui/MultipleEventSelectionModal.svelte";
	import SeanceCreationModal from "$lib/ui/SeanceCreationModal.svelte";
	import MarketingModal from "$lib/ui/MarketingModal.svelte";
	import { untrack } from "svelte";
  
  console.log("modalStore", modalStore.modal);
  // const modalRegistry = {
	// 	// Set a unique modal ID, then pass the component reference
	// 	bugReport: { ref: BugReportModal },
	// 	factureCreation: { ref: FactureCreationModal },
	// 	documentSelection: { ref: DocumentSelectionModal },
	// 	calendarEvent: { ref: CalendarEventModal },
	// 	multipleEventSelection: { ref: MultipleEventSelectionModal },
	// 	seanceCreationModal: { ref: SeanceCreationModal },
	// 	marketingModal: { ref: MarketingModal }
	// 	// ...
	// };

  // let ModalComponent = $state();

  // $effect(() => {
  //   page.state.modal;
  //   console.log('running effect for modal');
  //   console.log(modalStore.modal);
  //   let component = modalRegistry[modalStore.modal.component];
  //   console.log("component", component);
  //   if (component) {
  //     untrack(()=> (ModalComponent = component.ref));
  //   }
  // });
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!--
      Background backdrop, show/hide based on modal state.
  
      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    -->
    <div class={["fixed inset-0 bg-gray-500/75 transition-opacity", page.state.modal && 'ease-out duration-300 opacity-100 pointer-events-auto', !page.state.modal && 'ease-in duration-200 opacity-0 pointer-events-none']} aria-hidden="true"></div>
  
    <div class={["fixed inset-0 z-10 w-screen overflow-y-auto", !page.state.modal && 'pointer-events-none', page.state.modal && 'pointer-events-auto']}>
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <!--
          Modal panel, show/hide based on modal state.
  
          Entering: "ease-out duration-300"
            From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            To: "opacity-100 translate-y-0 sm:scale-100"
          Leaving: "ease-in duration-200"
            From: "opacity-100 translate-y-0 sm:scale-100"
            To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        -->
        <div class={["relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6", page.state.modal && 'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', !page.state.modal && 'ease-in duration-200 opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95']}>
          <div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
            <button onclick={() => modalStore.close()} type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
              <span class="sr-only">Close</span>
              <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {#if modalStore.modal.type !== 'component'}
            <div class="sm:flex sm:items-start">
              {#if modalStore.modal.type !== 'component'}
                <div class={["mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10", modalStore.modal.iconDiv || 'bg-red-100']}>
                  {#if modalStore?.modal?.icon}
                     {@render modalStore?.modal?.icon?.(modalStore?.modal?.iconCSS)}
                  {:else}
                    {@render warningOutlineIcon("size-6 text-red-600")}
                  {/if}
                </div>
              {/if}
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-base font-semibold text-gray-900" id="modal-title">{modalStore.modal.title}</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">{modalStore.modal.body}</p>
                </div>
              </div>
            </div>

          <!-- {#if modalStore.modal?.component} -->
          <!-- {/if} -->
           {:else}
          {@render modalStore?.modal?.component?.()}
          {/if}
<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button onclick={() => {
                modalStore.modal.response(true);
                modalStore.close()}} type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto">{modalStore.modal.buttonTextConfirm}</button>
            <button onclick={() => modalStore.close()} type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto">{modalStore.modal.buttonTextCancel}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  