<script>
	export let data;
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { Auth } from '@supabase/auth-ui-svelte';
	import { ThemeSupa } from '@supabase/auth-ui-shared';
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	import '../app.css';
	// session is null, if session is null we have no user, if its not null, we have a user.

	supabase.auth.onAuthStateChange(async (event, session) => {
		if (event === 'SIGNED_IN') {
			invalidateAll();
		}
		if (event === 'SIGNED_OUT') {
			await goto('login');
			invalidateAll();
		}
	});
</script>

<!-- Navbar -->
<div class="fixed left-0 right-0 top-0 justify-between bg-base-100">
	<div class="navbar mx-auto justify-between px-10">
		<!-- left side of navbar -->
		<div class="flex flex-row gap-2">
			<a href="/" class="btn btn-ghost text-xl">PokéDen</a>
			{#if session !== null}
				<a href="/{session.user.email}" class="btn btn-ghost">My Page</a>
			{/if}
		</div>
		<!-- right side of navbar -->
		<div>
			{#if session === null}
				<button on:click={() => goto('/login')}>Login</button>
			{:else}
				<span class="ml-2 text-lg text-white">{session.user.email}</span>
				<button
					class="ml-6"
					on:click={async () => {
						await supabase.auth.signOut();
					}}>Logout</button
				>
			{/if}
		</div>
	</div>
</div>

<slot></slot>
