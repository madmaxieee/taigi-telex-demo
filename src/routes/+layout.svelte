<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { isLoading } from '$lib/i18n';

	let { children } = $props();
</script>

<svelte:head>
	<title>Taigi Telex 輸入法線上體驗</title>
	<meta
		name="description"
		content="Taigi Telex (Tâi-gí Telex) 是一款類 Telex 聲調輸入法，支援台羅拼音（TL）與白話字（POJ）。線上即時體驗，或下載 macOS 版本使用。"
	/>
	<meta
		name="keywords"
		content="Taigi Telex,Tâi-gí Telex,台語輸入法,台羅拼音,白話字,Telex輸入法,Tâi-lô,POJ,台語"
	/>
	<link rel="canonical" href="https://telex.kahiok.com/" />
	<link rel="alternate" hreflang="zh-TW" href="https://telex.kahiok.com/" />
	<link rel="alternate" hreflang="en" href="https://telex.kahiok.com/?locale=en" />
	<link rel="alternate" hreflang="nan" href="https://telex.kahiok.com/?locale=nan" />
	<meta property="og:locale" content="zh_TW" />
	<meta property="og:title" content="Taigi Telex 輸入法線上體驗" />
	<meta
		property="og:description"
		content="Taigi Telex (Tâi-gí Telex) 是一款類 Telex 聲調輸入法，支援台羅拼音（TL）與白話字（POJ）。線上即時體驗，或下載 macOS 版本使用。"
	/>
	<meta property="og:url" content="https://telex.kahiok.com/" />
	<meta property="og:type" content="website" />
	<link rel="icon" href={favicon} />
</svelte:head>

{#if $isLoading}
	<div class="flex h-screen items-center justify-center bg-slate-50">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"
		></div>
	</div>
{:else}
	{@render children()}
{/if}
