<!-- localhost:5173/ayushsuperstar48@gmail.com -->
<script lang="ts">
	import { page } from '$app/stores';
	import { getPokemon, getPokemonList } from '$lib/pokemonapi';
	$: email = $page.params.email;
	export let data;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	let pokemonList: any = [];
	let pokemonData: any = []; // [{pikachu}, {balbasaur}, {charizard}]
	let profile = {
		description:
			'This is your description, feel free to write about you or your favourite Pokemon.',
		pokemon_ids: [19, 11, 8]
	};
	let ismodalOpen = false;
	let searchInput = '';

	// profiles in Supabase which has columns for a description, pokemon_ids, email
	// from this page, we can use the supabase object to then save to our database (grab data)

	async function refreshPokemonData() {
		pokemonData = [];
		profile.pokemon_ids.map(async (id) => {
			const data = await getPokemon(id.toString());
			if (pokemonData === undefined) {
				pokemonData = [data];
			} else {
				pokemonData = [...pokemonData, data];
			}
		});
	}

	async function saveprofile() {
		const { data: profileData, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('email', email);
		if (profileData?.length === 0) {
			// create a new row
			const { data, error } = await supabase
				.from('profiles')
				.insert({ ...profile, user_id: session?.user?.id, email: session?.user?.email });
		} else {
			// update the profile row
			const { data, error } = await supabase
				.from('profiles')
				.update(profile) // description, pokemon_id
				.eq('user_id', session?.user?.id);
		}
	}

	page.subscribe(async () => {
		pokemonList = await getPokemonList();
		// Try to grab the current profile (ayushsuperstar48@gmail.com)
		const { data: profileData, error: profileError } = await supabase
			.from('profiles')
			.select('description, pokemon_ids')
			.eq('email', email);
		// if profile profileData is undefined AND the current user is ayushsuperstar48@gmail.com
		// MAKE A NEW PROFILE
		if (profileData?.length === 0 && email === session?.user?.email) {
			// saveprofile
			await saveprofile();
		} else if (profileData !== null && profileData.length > 0) {
			profile = profileData[0];
		} else {
			console.log('This person has no profile!!!!');
			profile = {
				description: 'This user does not have a profile yet!',

				pokemon_ids: []
			};
		}
		// if profileData exists and it has data inside it
		// show ayushsuperstar48@gmail.com data to the user
		// if no data exists, say NO PROFILE
		await refreshPokemonData();
	});
	async function savePageEdits() {
		await saveprofile();
		await refreshPokemonData();
		ismodalOpen = false;
	}
	async function togglePokemon(id: number) {
		let pokemonIDs = profile.pokemon_ids;
		// [1,2,3] "toggle 2" -> [1,3] -> "toggle 2" -> [1,2,3]

		// make sure we never have more than 3 pokemons
		if (pokemonIDs.length >= 6 && !pokemonIDs.includes(id)) {
			alert('You can only have 6 pokemon maximum!');
			return;
		}
		// if pokemonIDs has ID, remove it
		if (pokemonIDs.includes(id)) {
			let index = pokemonIDs.indexOf(id);
			pokemonIDs.splice(index, 1);
		}
		// if pokemonIDs doesn't have ID, add it
		else {
			pokemonIDs.push(id);
		}
		profile.pokemon_ids = [...pokemonIDs];
	}
</script>

<div class="hero min-h-screen bg-base-300">
	<div class="hero-content">
		<div class="mt-24 max-w-2xl text-center">
			<h1 class="text-4xl font-bold text-white">{email}'s Page</h1>
			<p class="mx-auto max-w-md py-3">{profile.description}</p>
			<div class="grid grid-cols-3">
				{#if pokemonData === undefined}
					<p>Loading...</p>
				{:else}
					{#each pokemonData as pokemon}
						<div class="card m-4 bg-slate-700 shadow-lg shadow-blue-900">
							<div class="card-body">
								<div class="text-center">
									<img
										src={pokemon.sprites.front_default}
										alt="Pokemon"
										class="mx-auto h-32 w-32"
									/>
									<h2 class="text-2xl font-bold text-white">{pokemon.name}</h2>
									<p class="text-info">{pokemon.types[0].type.name}</p>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
			{#if email === session?.user?.email}
				<button class="btn btn-info" on:click={() => (ismodalOpen = true)}>Edit Page</button>
				<dialog class="min-w-lg modal" class:modal-open={ismodalOpen}>
					<div class="modal-box">
						<h3>Edit your PokéDen page</h3>
						<p>Here you can make edits to your page, such as description or pokemon selected.</p>
						<p class="p-2 text-white">Edit your description...</p>
						<textarea
							bind:value={profile.description}
							class="textarea textarea-bordered textarea-lg h-[300px] w-full max-w-md"
						/>
						<p class="p-2 text-white">Select your pokemon</p>
						<div class="m-3 grid max-h-[600px] grid-cols-3 overflow-y-scroll">
							<div class="col-span-3">
								<input
									type="text"
									class="input input-bordered w-full"
									placeholder="search for a pokemon"
									bind:value={searchInput}
								/>
							</div>
							{#each pokemonList as pokemon, index}
								{#if pokemon.name.includes(searchInput)}
									<button
										class={'card m-1 h-12 items-center justify-center bg-slate-700 p-1 ' +
											(profile.pokemon_ids.includes(index + 1) ? 'border-2 border-blue-600' : '')}
										on:click={() => togglePokemon(index + 1)}
									>
										<div class="text-center">
											<h2 class="text-xl text-white">{pokemon.name}</h2>
										</div>
									</button>
								{/if}
							{/each}
						</div>
						<button class="btn btn-success" on:click={() => savePageEdits()}>Save Edits</button>
					</div>
				</dialog>
			{/if}
		</div>
	</div>
</div>
