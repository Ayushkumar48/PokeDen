import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

export default {
	preprocess: preprocess({
		typescript: true
	}),
	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib'
		}
	}
};
