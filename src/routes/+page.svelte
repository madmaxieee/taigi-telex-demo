<script lang="ts">
	import { processTelexInput } from '$lib/telex';

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
		const toneKeys = ['v', 'y', 'r', 'w', 'x', 'q', 'z', 'c', 'f'];
		if (toneKeys.includes(event.key.toLowerCase())) {
			event.preventDefault();
			const newText = inputText + event.key;
			const processed = processTelexInput(newText);

			// TODO: Implement handleTextBeforeTransform - called before Telex transformation
			// This callback can modify the text before transformation is applied
			// Example use: custom preprocessing, filtering, etc.
			const finalText = processed; // Replace with: handleTextBeforeTransform(processed)

			inputText = finalText;
			handleOutputChange(finalText);
		}
	}

	function clearText() {
		// TODO: Implement handleClear - called when text is cleared
		// This callback can be used to reset related state or notify other components
		console.log('Text cleared');

		inputText = '';
		outputText = '';
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

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
	<div class="mx-auto max-w-4xl">
		<!-- Title -->
		<header class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold text-slate-800 md:text-5xl lg:text-6xl">
				<span class="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
					Tâi-gí
				</span>
				<span class="text-slate-700">Telex Keyboard</span>
			</h1>
			<p class="text-lg text-slate-600 md:text-xl">
				Type Taiwanese Hokkien using Telex-style input for Tâi-lô romanization
			</p>
		</header>

		<!-- Input Section -->
		<section class="mb-8 rounded-2xl bg-white p-6 shadow-lg md:p-8">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<label for="telex-input" class="text-lg font-semibold text-slate-700">
						Try it out:
					</label>
					<button
						onclick={clearText}
						class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 focus:ring-2 focus:ring-slate-400 focus:outline-none"
					>
						Clear
					</button>
				</div>

				<input
					id="telex-input"
					type="text"
					bind:value={inputText}
					onkeydown={handleKeyDown}
					oninput={handleInputChange}
					placeholder="Type here... (e.g., savng -> sáng, chitf -> chit-)"
					class="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-6 py-4 text-xl text-slate-800 placeholder-slate-400 transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:outline-none md:text-2xl"
				/>

				{#if outputText && outputText !== inputText}
					<div class="rounded-lg bg-teal-50 p-4">
						<p class="text-sm font-medium text-teal-700">Transformed:</p>
						<p class="text-xl font-semibold text-teal-800 md:text-2xl">{outputText}</p>
					</div>
				{/if}
			</div>
		</section>

		<!-- Explanation Section -->
		<section class="rounded-2xl bg-white p-6 shadow-lg md:p-8">
			<h2 class="mb-6 text-2xl font-bold text-slate-800">How Taiwanese Telex Works</h2>

			<div class="space-y-6 text-slate-700">
				<p class="text-base leading-relaxed md:text-lg">
					This input method uses Telex-style keystrokes to type Taiwanese Hokkien (Tâi-lô)
					romanization. Tonal marks can be placed either inline (right after the vowel) or at the
					end of each syllable.
				</p>

				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="bg-slate-100">
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>Key</th
								>
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>Tone</th
								>
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>Example</th
								>
								<th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700"
									>Result</th
								>
							</tr>
						</thead>
						<tbody>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">v</td>
								<td class="border border-slate-300 px-4 py-3">2nd tone (high rising)</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">savng / sangv</td>
								<td class="border border-slate-300 px-4 py-3">sáng</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">y</td>
								<td class="border border-slate-300 px-4 py-3">3rd tone (high falling)</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">chay / chy</td>
								<td class="border border-slate-300 px-4 py-3">chà</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">r</td>
								<td class="border border-slate-300 px-4 py-3">5th tone (low rising)</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">kar / kra</td>
								<td class="border border-slate-300 px-4 py-3">kâ</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">w</td>
								<td class="border border-slate-300 px-4 py-3">7th tone (low falling)</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">saw / sw</td>
								<td class="border border-slate-300 px-4 py-3">sā</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">x</td>
								<td class="border border-slate-300 px-4 py-3">8th tone (low checked)</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">sax / sx</td>
								<td class="border border-slate-300 px-4 py-3">sa̍</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">q</td>
								<td class="border border-slate-300 px-4 py-3">9th tone (high checked)</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">saq / sq</td>
								<td class="border border-slate-300 px-4 py-3">sa̋</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">z</td>
								<td class="border border-slate-300 px-4 py-3">Consonant: ts</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">zo</td>
								<td class="border border-slate-300 px-4 py-3">tso</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">c</td>
								<td class="border border-slate-300 px-4 py-3">Consonant: tsh</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">ci</td>
								<td class="border border-slate-300 px-4 py-3">tshi</td>
							</tr>
							<tr class="bg-white hover:bg-slate-50">
								<td class="border border-slate-300 px-4 py-3 font-mono font-medium">f</td>
								<td class="border border-slate-300 px-4 py-3">Hyphen</td>
								<td class="border border-slate-300 px-4 py-3 font-mono">chitf</td>
								<td class="border border-slate-300 px-4 py-3">chit-</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="rounded-xl bg-teal-50 p-6">
					<h3 class="mb-3 text-lg font-semibold text-teal-800">Tone Position Rules</h3>
					<p class="mb-2 text-teal-700">
						<strong>Vowel priority:</strong> a > e > u > i > o
					</p>
					<p class="mb-2 text-teal-700">
						<strong>For "oo" vowel:</strong> mark goes on the first o (e.g., oov → óo)
					</p>
					<p class="mb-2 text-teal-700">
						<strong>For "ng":</strong> mark goes on n, not g
					</p>
					<p class="text-teal-700">
						<strong>Standalone ng/m:</strong> Can take tone marks when no other vowels are present
					</p>
				</div>

				<div class="rounded-xl bg-slate-50 p-6">
					<h3 class="mb-3 text-lg font-semibold text-slate-800">Examples</h3>
					<ul class="space-y-2 text-slate-700">
						<li>
							<span class="font-mono text-teal-600">savng</span> or
							<span class="font-mono text-teal-600">sangv</span> → sáng
						</li>
						<li><span class="font-mono text-teal-600">chitf</span> → chit-</li>
						<li><span class="font-mono text-teal-600">zo</span> → tso</li>
						<li><span class="font-mono text-teal-600">ci</span> → tshi</li>
						<li><span class="font-mono text-teal-600">oov</span> → óo</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="mt-12 text-center text-sm text-slate-500">
			<p>Taiwanese Hokkien (Tâi-lô) Telex Input Method</p>
		</footer>
	</div>
</div>
