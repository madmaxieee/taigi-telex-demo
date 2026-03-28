<script lang="ts">
	import { processTelexInput } from '$lib/telex';
	import { tick } from 'svelte';
	import { _ } from 'svelte-i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	let inputText = $state('');
	let outputText = $state('');

	// TODO: Implement handleInputChange - called when input value changes
	// This callback can be used to add custom logic when the user types
	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		// TODO: Add custom logic here (e.g., logging, validation, etc.)
		console.log('Input changed:', newValue);

		inputText = newValue;
	}

	// TODO: Implement handleOutputChange - called when output value changes
	// This callback can be used to react to Telex transformations
	function handleOutputChange(newValue: string) {
		// TODO: Add custom logic here (e.g., save to database, sync with other components, etc.)
		console.log('Output changed:', newValue);

		outputText = newValue;
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Prevent default behavior for tone keys to handle them manually
		// But allow native shortcuts like cmd-c, cmd-a, etc. to work
		const toneKeys = ['v', 'y', 'r', 'w', 'x', 'q', 'z', 'c', 'f'];
		if (toneKeys.includes(event.key.toLowerCase()) && !event.metaKey && !event.ctrlKey) {
			event.preventDefault();
			const newText = inputText + event.key;
			const processed = processTelexInput(newText);

			// TODO: Implement handleTextBeforeTransform - called before Telex transformation
			// This callback can modify the text before transformation is applied
			// Example use: custom preprocessing, filtering, etc.
			const finalText = processed; // Replace with: handleTextBeforeTransform(processed)

			inputText = finalText;
			handleOutputChange(finalText);
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
				handleOutputChange(newText);

				// Restore cursor position after state update
				tick().then(() => {
					target.selectionStart = newCursorPosition;
					target.selectionEnd = newCursorPosition;
				});
			}
		}
	}

	function clearText() {
		// TODO: Implement handleClear - called when text is cleared
		// This callback can be used to reset related state or notify other components
		console.log('Text cleared');

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

	// Reactive statement to process text when input changes
	$effect(() => {
		if (inputText) {
			outputText = processTelexInput(inputText);
		} else {
			outputText = '';
		}
	});
</script>

<div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-8">
	<div class="mx-auto max-w-4xl">
		<!-- Title -->
		<header class="mb-12 text-center">
			<div class="mb-4 flex justify-end">
				<LanguageSelector />
			</div>
			<h1 class="mb-4 text-4xl font-bold text-slate-800 md:text-5xl lg:text-6xl">
				<span class="bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
					Tâi-gí
				</span>
				<span class="text-slate-700">{$_('title').split(' ').slice(1).join(' ')}</span>
			</h1>
			<p class="text-lg text-slate-600 md:text-xl">
				{$_('subtitle')}
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
							class="rounded-lg bg-teal-100 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-200 focus:ring-2 focus:ring-teal-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
					bind:value={inputText}
					onkeydown={handleKeyDown}
					oninput={handleInputChange}
					placeholder={$_('input.placeholder')}
					class="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-6 py-4 text-xl text-slate-800 placeholder-slate-400 transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:outline-none md:text-2xl"
				/>

				{#if outputText && outputText !== inputText}
					<div class="rounded-lg bg-teal-50 p-4">
						<p class="text-sm font-medium text-teal-700">{$_('input.transformed')}</p>
						<p class="text-xl font-semibold text-teal-800 md:text-2xl">{outputText}</p>
					</div>
				{/if}
			</div>
		</section>

		<!-- Explanation Section -->
		<section class="rounded-2xl bg-white p-6 shadow-lg md:p-8">
			<h2 class="mb-6 text-2xl font-bold text-slate-800">{$_('howItWorks.title')}</h2>

			<div class="space-y-6 text-slate-700">
				<p class="text-base leading-relaxed md:text-lg">
					{$_('howItWorks.description')}
				</p>

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
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>{$_('howItWorks.table.example')}</th
								>
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>{$_('howItWorks.table.result')}</th
								>
							</tr>
						</thead>
						<tbody>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">v</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.2nd')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tev</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">té</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">y</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.3rd')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">khooy</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">khòo</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">r</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.5th')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">langr / larng</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">lâng</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">w</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.7th')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">phiwnn / phinnw</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">phīnn</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">x</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.8th')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tixt / titx</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">ti̍t</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">q</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.9th')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tsaqng / tsangq</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tsa̋ng</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">z</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.ts')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">zo</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tso</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">c</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.tsh')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">ci</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tshi</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">f</td>
								<td class="border border-slate-300 px-4 py-3">{$_('howItWorks.tones.hyphen')}</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tai</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">tai-</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="rounded-xl bg-teal-50 p-6">
					<h3 class="mb-3 text-lg font-semibold text-teal-800">{$_('rules.title')}</h3>
					<p class="mb-2 text-teal-700">
						<strong>{$_('rules.vowelPriority')}</strong> a > e > u > i > o
					</p>
					<p class="mb-2 text-teal-700">
						<strong>{$_('rules.ooVowel')}</strong>
						{$_('rules.ooVowelDesc')}
					</p>
					<p class="mb-2 text-teal-700">
						<strong>{$_('rules.ng')}</strong>
						{$_('rules.ngDesc')}
					</p>
					<p class="text-teal-700">
						<strong>{$_('rules.standalone')}</strong>
						{$_('rules.standaloneDesc')}
					</p>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="mt-12 text-center text-sm text-slate-500">
			<p>{$_('footer')}</p>
		</footer>
	</div>
</div>
