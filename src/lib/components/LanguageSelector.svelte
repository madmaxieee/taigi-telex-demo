<script lang="ts">
	import { locale, languages, setStoredLocale } from '$lib/i18n';

	function handleLanguageChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		setStoredLocale(select.value);
	}
</script>

<div class="relative">
	<select
		value={$locale}
		onchange={handleLanguageChange}
		class="cursor-pointer appearance-none rounded-lg bg-white/80 px-4 py-2 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
		aria-label="Select language"
	>
		{#each languages as lang (lang.code)}
			<option value={lang.code}>{lang.label} - {lang.name}</option>
		{/each}
	</select>
	<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</div>
</div>
