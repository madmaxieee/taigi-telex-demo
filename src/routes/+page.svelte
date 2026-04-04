<script lang="ts">
	import { processTelexInput, type Mode } from '$lib/telex';
	import { tick } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	// Combined table data with both TL and POJ examples
	const toneRows = [
		{
			key: 'v',
			labelKey: 'howItWorks.tones.2nd',
			tlExample: 'tev',
			tlResult: 'té',
			pojExample: 'hoov',
			pojResult: 'hó͘ '
		},
		{
			key: 'y',
			labelKey: 'howItWorks.tones.3rd',
			tlExample: 'khooy',
			tlResult: 'khòo',
			pojExample: 'pay',
			pojResult: 'pà'
		},
		{
			key: 'd',
			labelKey: 'howItWorks.tones.5th',
			tlExample: 'langd',
			tlResult: 'lâng',
			pojExample: 'kaud',
			pojResult: 'kâu'
		},
		{
			key: 'w',
			labelKey: 'howItWorks.tones.7th',
			tlExample: 'phinnw',
			tlResult: 'phīnn',
			pojExample: 'ciunnw',
			pojResult: 'chhiūⁿ'
		},
		{
			key: 'x',
			labelKey: 'howItWorks.tones.8th',
			tlExample: 'titx',
			tlResult: 'ti̍t',
			pojExample: 'lokx',
			pojResult: 'lo̍k'
		},
		{
			key: 'q',
			labelKey: 'howItWorks.tones.9th',
			tlExample: 'tsangq',
			tlResult: 'tsa̋ng',
			pojExample: 'ianq',
			pojResult: 'ia̋n'
		}
	];

	const otherRows = [
		{
			key: 'z',
			tlLabelKey: 'howItWorks.functions.ts',
			pojLabelKey: 'howItWorks.functions.ch',
			tlExample: 'zo',
			tlResult: 'tso',
			pojExample: 'zit',
			pojResult: 'chit'
		},
		{
			key: 'c',
			tlLabelKey: 'howItWorks.functions.tsh',
			pojLabelKey: 'howItWorks.functions.chh',
			tlExample: 'ci',
			tlResult: 'tshi',
			pojExample: 'coew',
			pojResult: 'chhōe'
		},
		{
			key: 'f',
			labelKey: 'howItWorks.functions.hyphen',
			tlExample: 'taif',
			tlResult: 'tai-',
			pojExample: 'taif',
			pojResult: 'tai-'
		},
		{
			key: 'nn',
			labelKey: 'howItWorks.functions.nn',
			tlExample: '-',
			tlResult: '-',
			pojExample: 'sann',
			pojResult: 'saⁿ'
		},
		{
			key: 'oo',
			labelKey: 'howItWorks.functions.oo',
			tlExample: '-',
			tlResult: '-',
			pojExample: 'poo',
			pojResult: 'po͘'
		}
	];

	let inputText = $state('');
	let outputText = $state('');
	let mode = $state<Mode>('tl');
	let inputElement = $state<HTMLInputElement | null>(null);

	// Load mode from URL or localStorage on mount
	$effect(() => {
		if (!browser) return;

		// First check URL param
		const urlMode = page.url.searchParams.get('mode') as Mode | null;
		if (urlMode === 'tl' || urlMode === 'poj') {
			mode = urlMode;
		} else {
			// Then check localStorage
			const storedMode = localStorage.getItem('telex-mode') as Mode | null;
			if (storedMode === 'tl' || storedMode === 'poj') {
				mode = storedMode;
				// Update URL to match
				updateURL(storedMode);
			}
		}
	});

	// Update URL when mode changes
	function updateURL(newMode: Mode) {
		if (!browser) return;
		const url = new URL(page.url);
		url.searchParams.set('mode', newMode);
		window.history.replaceState({}, '', url.toString());
	}

	function handleModeChange(newMode: Mode) {
		mode = newMode;
		localStorage.setItem('telex-mode', newMode);
		updateURL(newMode);
		// Re-process input with new mode
		if (inputText) {
			outputText = processTelexInput(inputText, mode);
		}
	}

	// Reactive statement to process text when input changes or mode changes
	$effect(() => {
		if (inputText) {
			const processed = processTelexInput(inputText, mode);
			outputText = processed;
			// Feed processed output back to input field for live transformation
			if (processed !== inputText) {
				inputText = processed;
				// Restore cursor position to end after transformation
				tick().then(() => {
					if (inputElement) {
						inputElement.selectionStart = processed.length;
						inputElement.selectionEnd = processed.length;
					}
				});
			}
		} else {
			outputText = '';
		}
	});

	function handleKeyDown(event: KeyboardEvent) {
		// Prevent default behavior for tone keys to handle them manually
		// But allow native shortcuts like cmd-c, cmd-a, etc. to work
		const toneKeys = ['v', 'y', 'd', 'w', 'x', 'q', 'z', 'c', 'f'];
		if (toneKeys.includes(event.key.toLowerCase()) && !event.metaKey && !event.ctrlKey) {
			event.preventDefault();
			const newText = inputText + event.key;
			const processed = processTelexInput(newText, mode);
			inputText = processed;
			return;
		}

		// Handle Delete key to remove entire composed characters (e.g., á -> "", not á -> a)
		// This prevents the browser from only removing the combining tone mark
		// Allow native shortcuts (cmd+delete, alt+delete, etc.) to work normally
		if (
			(event.key === 'Delete' || event.key === 'Backspace') &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey
		) {
			const target = event.target as HTMLInputElement;
			const cursorPosition = target.selectionStart ?? inputText.length;
			const cursorEnd = target.selectionEnd ?? cursorPosition;

			// Only handle if there's no text selection (normal delete/backspace behavior)
			if (cursorPosition === cursorEnd) {
				event.preventDefault();

				let newText: string;
				let newCursorPosition: number;

				if (event.key === 'Backspace' && cursorPosition > 0) {
					// Backspace: delete character before cursor
					// Find the start of the grapheme cluster before cursor
					const textBefore = inputText.slice(0, cursorPosition);
					// Use Intl.Segmenter to properly handle grapheme clusters
					const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
					const segments = Array.from(segmenter.segment(textBefore));
					if (segments.length > 0) {
						const lastSegment = segments[segments.length - 1];
						newText = inputText.slice(0, lastSegment.index) + inputText.slice(cursorPosition);
						newCursorPosition = lastSegment.index;
					} else {
						newText = inputText;
						newCursorPosition = cursorPosition;
					}
				} else if (event.key === 'Delete' && cursorPosition < inputText.length) {
					// Delete: delete character at cursor
					const textAfter = inputText.slice(cursorPosition);
					const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
					const segments = Array.from(segmenter.segment(textAfter));
					if (segments.length > 0) {
						const firstSegment = segments[0];
						newText =
							inputText.slice(0, cursorPosition) +
							inputText.slice(cursorPosition + firstSegment.segment.length);
						newCursorPosition = cursorPosition;
					} else {
						newText = inputText;
						newCursorPosition = cursorPosition;
					}
				} else {
					return;
				}

				inputText = newText;

				// Restore cursor position after state update
				tick().then(() => {
					target.selectionStart = newCursorPosition;
					target.selectionEnd = newCursorPosition;
				});
			}
		}
	}

	function clearText() {
		inputText = '';
		outputText = '';
	}

	async function copyText() {
		const textToCopy = outputText || inputText;
		if (!textToCopy) return;

		try {
			await navigator.clipboard.writeText(textToCopy);
			console.log('Text copied:', textToCopy);
		} catch (err) {
			console.error('Failed to copy text:', err);
		}
	}

	// Get mode name for display
	function getModeName(m: Mode): string {
		return m === 'tl' ? 'Tâi-lô' : 'Pe̍h-ōe-jī';
	}
</script>

<div
	class="min-h-screen p-4 md:p-8"
	class:mode-tl={mode === 'tl'}
	class:mode-poj={mode === 'poj'}
	style="background-color: var(--bg-tint, #f8fafc);"
>
	<div class="mx-auto max-w-4xl">
		<!-- Title -->
		<header class="mb-12 text-center">
			<div class="mb-4 flex flex-wrap justify-end gap-2">
				<a
					href="https://github.com/madmaxieee/taigi-telex"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white hover:text-slate-900 focus:ring-2 focus:ring-[var(--theme-500)] focus:outline-none"
					aria-label="View on GitHub"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clip-rule="evenodd"
						/>
					</svg>
					GitHub
				</a>
				<a
					href="https://github.com/madmaxieee/taigi-telex/releases/tag/latest"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 rounded-lg bg-[var(--theme-600)]/90 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--theme-600)] focus:ring-2 focus:ring-[var(--theme-500)] focus:outline-none"
					aria-label={$_('download')}
				>
					<svg
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
					{$_('download')}
				</a>
				<LanguageSelector />
			</div>

			<h1 class="mb-4 text-4xl font-bold text-slate-800 md:text-5xl lg:text-6xl">
				<span class="text-[var(--theme-600)]"> Tâi-gí </span>
				<span class="text-slate-700">{$_('title').split(' ').slice(1).join(' ')}</span>
			</h1>

			<!-- Mode Selector -->
			<div class="mb-6 flex justify-center">
				<div class="flex gap-2 rounded-xl bg-white p-2 shadow-md">
					<button
						onclick={() => handleModeChange('tl')}
						class="rounded-md px-6 py-2 text-base font-semibold transition-all"
						class:bg-[var(--theme-600)]={mode === 'tl'}
						class:text-white={mode === 'tl'}
						class:text-slate-700={mode !== 'tl'}
						class:hover:bg-slate-200={mode !== 'tl'}
					>
						{$_('modeSelector.tl')}
					</button>
					<button
						onclick={() => handleModeChange('poj')}
						class="rounded-md px-6 py-2 text-base font-semibold transition-all"
						class:bg-[var(--theme-600)]={mode === 'poj'}
						class:text-white={mode === 'poj'}
						class:text-slate-700={mode !== 'poj'}
						class:hover:bg-slate-200={mode !== 'poj'}
					>
						{$_('modeSelector.poj')}
					</button>
				</div>
			</div>

			<p class="text-lg text-slate-600 md:text-xl">
				{$_('subtitle', { values: { mode: getModeName(mode) } })}
			</p>
		</header>

		<!-- Input Section -->
		<section class="mb-8 rounded-2xl bg-white p-6 shadow-lg md:p-8">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<label for="telex-input" class="text-lg font-semibold text-slate-700">
						{$_('input.label')}
					</label>
					<div class="flex gap-2">
						<button
							onclick={copyText}
							disabled={!inputText && !outputText}
							class="rounded-lg bg-[var(--theme-100)] px-4 py-2 text-sm font-medium text-[var(--theme-700)] transition-colors hover:bg-[var(--theme-200)] focus:ring-2 focus:ring-[var(--theme-400)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{$_('input.copy')}
						</button>
						<button
							onclick={clearText}
							class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 focus:ring-2 focus:ring-slate-400 focus:outline-none"
						>
							{$_('input.clear')}
						</button>
					</div>
				</div>

				<input
					id="telex-input"
					type="text"
					bind:this={inputElement}
					bind:value={inputText}
					onkeydown={handleKeyDown}
					placeholder={$_('input.placeholder')}
					class="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-6 py-4 text-xl text-slate-800 placeholder-slate-400 transition-all focus:border-[var(--theme-500)] focus:bg-white focus:ring-4 focus:ring-[var(--theme-500)]/20 focus:outline-none md:text-2xl"
				/>
			</div>
		</section>

		<!-- Explanation Section -->
		<section class="rounded-2xl bg-white p-6 shadow-lg md:p-8">
			<h2 class="mb-6 text-2xl font-bold text-slate-800">{$_('howItWorks.title')}</h2>

			<div class="space-y-6 text-slate-700">
				<p class="text-base leading-relaxed md:text-lg">
					{$_('howItWorks.description')}
				</p>

				<!-- Combined Tone Examples Table -->
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="bg-slate-100">
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>{$_('howItWorks.table.key')}</th
								>
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>{$_('howItWorks.table.tone')}</th
								>
								<th
									class="border border-slate-300 px-4 py-3 text-left font-semibold"
									class:bg-teal-50={mode === 'tl'}
									class:text-teal-800={mode === 'tl'}
									class:bg-slate-100={mode !== 'tl'}
									class:text-slate-600={mode !== 'tl'}
									colspan="2">{$_('modeSelector.tl')}</th
								>
								<th
									class="border border-slate-300 px-4 py-3 text-left font-semibold"
									class:bg-orange-50={mode === 'poj'}
									class:text-orange-800={mode === 'poj'}
									class:bg-slate-100={mode !== 'poj'}
									class:text-slate-600={mode !== 'poj'}
									colspan="2">{$_('modeSelector.poj')}</th
								>
							</tr>
							<tr class="bg-slate-50 text-sm">
								<th class="border border-slate-300 px-4 py-2"></th>
								<th class="border border-slate-300 px-4 py-2"></th>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'tl'
										? 'bg-teal-50/50'
										: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.example')}</th
								>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'tl'
										? 'bg-teal-50/50'
										: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.result')}</th
								>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'poj'
										? 'bg-orange-50/50'
										: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.example')}</th
								>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'poj'
										? 'bg-orange-50/50'
										: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.result')}</th
								>
							</tr>
						</thead>
						<tbody>
							{#each toneRows as row (row.key)}
								<tr class="bg-white">
									<td class="border border-slate-300 px-4 py-3 font-medium">{row.key}</td>
									<td class="border border-slate-300 px-4 py-3">{$_(row.labelKey)}</td>
									<td
										class="border border-slate-300 px-4 py-3 {mode === 'tl'
											? 'bg-teal-50/30'
											: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-900' : 'text-slate-700'}"
										>{row.tlExample}</td
									>
									<td
										class="border border-slate-300 px-4 py-3 font-medium {mode === 'tl'
											? 'bg-teal-50/30'
											: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-900' : 'text-slate-700'}"
										>{row.tlResult}</td
									>
									<td
										class="border border-slate-300 px-4 py-3 {mode === 'poj'
											? 'bg-orange-50/30'
											: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-900' : 'text-slate-700'}"
										>{row.pojExample}</td
									>
									<td
										class="border border-slate-300 px-4 py-3 font-medium {mode === 'poj'
											? 'bg-orange-50/30'
											: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-900' : 'text-slate-700'}"
										>{row.pojResult}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<p class="text-base leading-relaxed md:text-lg">
					{$_('howItWorks.additionalKeysDescription')}
				</p>

				<!-- Combined Functions Table -->
				<div class="mt-8 overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="bg-slate-100">
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>{$_('howItWorks.table.key')}</th
								>
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>{$_('howItWorks.table.function')}</th
								>
								<th
									class="border border-slate-300 px-4 py-3 text-left font-semibold {mode === 'tl'
										? 'bg-teal-50'
										: 'bg-slate-100'} {mode === 'tl' ? 'text-teal-800' : 'text-slate-600'}"
									colspan="2">{$_('modeSelector.tl')}</th
								>
								<th
									class="border border-slate-300 px-4 py-3 text-left font-semibold {mode === 'poj'
										? 'bg-orange-50'
										: 'bg-slate-100'} {mode === 'poj' ? 'text-orange-800' : 'text-slate-600'}"
									colspan="2">{$_('modeSelector.poj')}</th
								>
							</tr>
							<tr class="bg-slate-50 text-sm">
								<th class="border border-slate-300 px-4 py-2"></th>
								<th class="border border-slate-300 px-4 py-2"></th>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'tl'
										? 'bg-teal-50/50'
										: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.example')}</th
								>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'tl'
										? 'bg-teal-50/50'
										: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.result')}</th
								>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'poj'
										? 'bg-orange-50/50'
										: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.example')}</th
								>
								<th
									class="border border-slate-300 px-4 py-2 font-medium {mode === 'poj'
										? 'bg-orange-50/50'
										: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-700' : 'text-slate-500'}"
									>{$_('howItWorks.table.result')}</th
								>
							</tr>
						</thead>
						<tbody>
							{#each otherRows as row (row.key)}
								<tr class="bg-white">
									<td class="border border-slate-300 px-4 py-3 font-medium">{row.key}</td>
									<td class="border border-slate-300 px-4 py-3">
										{#if row.labelKey}
											{$_(row.labelKey)}
										{:else}
											{mode === 'tl' ? $_(row.tlLabelKey ?? '') : $_(row.pojLabelKey ?? '')}
										{/if}
									</td>
									<td
										class="border border-slate-300 px-4 py-3 {mode === 'tl'
											? 'bg-teal-50/30'
											: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-900' : 'text-slate-700'}"
										class:text-slate-400={row.tlExample === '-'}>{row.tlExample}</td
									>
									<td
										class="border border-slate-300 px-4 py-3 font-medium {mode === 'tl'
											? 'bg-teal-50/30'
											: 'bg-slate-50'} {mode === 'tl' ? 'text-teal-900' : 'text-slate-700'}"
										class:text-slate-400={row.tlResult === '-'}>{row.tlResult}</td
									>
									<td
										class="border border-slate-300 px-4 py-3 {mode === 'poj'
											? 'bg-orange-50/30'
											: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-900' : 'text-slate-700'}"
										class:text-slate-400={row.pojExample === '-'}>{row.pojExample}</td
									>
									<td
										class="border border-slate-300 px-4 py-3 font-medium {mode === 'poj'
											? 'bg-orange-50/30'
											: 'bg-slate-50'} {mode === 'poj' ? 'text-orange-900' : 'text-slate-700'}"
										class:text-slate-400={row.pojResult === '-'}>{row.pojResult}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="mt-12 text-center text-sm text-slate-500">
			<p>{$_('footer')}</p>
			<p class="mt-2">
				<a
					href="mailto:feedback@telex.kahiok.com?subject=feedback"
					class="text-[var(--theme-600)] hover:text-[var(--theme-700)] hover:underline"
				>
					feedback@telex.kahiok.com
				</a>
			</p>
		</footer>
	</div>
</div>
