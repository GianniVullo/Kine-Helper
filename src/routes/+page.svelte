<script>
	import Greet from '../lib/Greet.svelte';
	import { Auth } from '@supabase/auth-ui-svelte';
	import { ThemeSupa } from '@supabase/auth-ui-shared';

	export let data;
	const views = [
		{ id: 'sign_in', title: 'Sign In' },
		{ id: 'sign_up', title: 'Sign Up' },
	];
    const additionnal_view = [
        { id: 'forgotten_password', title: 'Forgotten Password' },
        { id: 'update_password', title: 'Update Password' },
    ]
	let view = views[0];
</script>

<div class="w-full h-[100vh] flex justify-center items-start bg-gray-800">
    <div class="flex flex-col w-[350px] h-auto mt-52 bg-gray-700 rounded py-10 px-5 shadow shadow-white">
        <div class="flex justify-start">
            {#each views as v}
                <button class="text-white border-gray-800 border hover:scale-105 duration-200 rounded mr-2 p-2" on:click={() => (view = v)}>{v.title}</button>
            {/each}
        </div>
        <div class="col-6 form-widget">
            <Auth
                supabaseClient={data.supabase}
                view={view.id}
                redirectTo={`account`}
                showLinks={false}
                theme="dark"
                appearance={{ theme: ThemeSupa }}
            />
        </div>
    </div>
</div>
