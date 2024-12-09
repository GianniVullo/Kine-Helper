<script>
    import {getContext} from 'svelte';
    import Section from './Section.svelte';

    let {_bodyEl, _viewDates, _slotTimeLimits, _times, scrollTime, slotDuration, slotHeight, theme} = getContext('state');

    let el;
    let compact;
    let lines = [];

    $: $_bodyEl = el;

    $: {
        compact = $slotDuration.seconds >= 3600;
        lines.length = $_times.length;
    }

    $: if (el) {
        $_viewDates;
        $scrollTime;
        scrollToTime()
    }

    function scrollToTime() {
        el.scrollTop = (($scrollTime.seconds - $_slotTimeLimits.min.seconds) / $slotDuration.seconds - 0.5) * $slotHeight;
    }
</script>

<div
    bind:this={el}
    class="flex flex-auto"
>
<!-- <div class="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100"></div> -->
    <div class="{$theme.content}">
        <Section>
            <svelte:fragment slot="lines">
                {#each lines as line}
                    <div class="{$theme.line}"></div>
                {/each}
            </svelte:fragment>
            <slot></slot>
        </Section>
    </div>
</div>
