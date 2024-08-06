import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

const supabaseurl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseanonkey = process.env.PUBLIC_SUPABASE_ANON_KEY!;
export const ssr = false;

export const load: LayoutLoad = async ({ fetch, data, depends }: any) => {
	depends('supabase:auth');

	const supabase = createBrowserClient(supabaseurl, supabaseanonkey, {
		global: {
			fetch
		},
		cookies: {
			get: (key: string) => {
				if (!isBrowser()) {
					return JSON.stringify(data.session);
				}
				const cookie = parse(document.cookie);
				return cookie[key];
			},
			set: (key: string, value: string) => {
				document.cookie = `${key}=${value}`;
			},
			remove: (key: string) => {
				document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
			}
		}
	});
	const {
		data: { session }
	} = await supabase.auth.getSession();
	return { supabase, session };
};
