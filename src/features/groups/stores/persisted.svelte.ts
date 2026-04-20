import { browser } from '$app/environment';

export function persistedState<T>(key: string, initial: T) {
	function load(): T {
		if (!browser) return initial;
		try {
			const raw = localStorage.getItem(key);
			return raw !== null ? (JSON.parse(raw) as T) : initial;
		} catch {
			return initial;
		}
	}

	let value = $state<T>(load());

	$effect.root(() => {
		$effect(() => {
			if (browser) {
				localStorage.setItem(key, JSON.stringify(value));
			}
		});
	});

	return {
		get value() {
			return value;
		},
		set value(v: T) {
			value = v;
		}
	};
}
