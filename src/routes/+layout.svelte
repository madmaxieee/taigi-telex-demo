<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { isLoading } from '$lib/i18n';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if $isLoading}
	<div class="flex h-screen items-center justify-center bg-slate-50">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"
		></div>
	</div>
{:else}
	{@render children()}
{/if}
