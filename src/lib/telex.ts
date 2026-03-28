// Taiwanese Telex transformation logic for Tâi-lô romanization

// Taiwanese tone marks mapping
// Key -> combining character(s) for the tone
const TONE_MARKS: Record<string, string> = {
	v: '\u0301', // combining acute (2nd tone)
	y: '\u0300', // combining grave (3rd tone)
	d: '\u0302', // combining circumflex (5th tone)
	w: '\u0304', // combining macron (7th tone)
	x: '\u030D', // combining vertical line (8th tone)
	q: '\u030B' // combining double acute (9th tone)
};

// All combining tone marks for detection
const ALL_TONE_MARKS_REGEX = /[\u0300-\u036f\u0301\u0300\u0302\u0304\u030D\u030B]/g;

// Vowel priority for tone placement: a > e > u > i > o
// For compound vowels separated by hyphen/space, apply priority within each part
const VOWEL_PRIORITY = ['a', 'e', 'u', 'i', 'o'];

// Check if character is a vowel (base form)
function isVowel(char: string): boolean {
	return VOWEL_PRIORITY.includes(char.toLowerCase());
}

// Get the base vowel character (without tone marks)
function getBaseVowel(char: string): string {
	return char.normalize('NFD').replace(ALL_TONE_MARKS_REGEX, '');
}

// Find the position of a vowel that already has a tone mark
function findExistingTonePosition(syllable: string): number {
	const chars = [...syllable];

	for (let i = 0; i < chars.length; i++) {
		if (hasToneMark(chars[i])) {
			return i;
		}
	}
	return -1;
}

// Find the position where tone should be placed within a syllable
// Rules: a > e > u > i > o, for oo mark first o, for ng mark n not g
function findTonePosition(syllable: string): number {
	const chars = [...syllable]; // Use spread for proper Unicode handling

	// Check for 'oo' vowel - if found, mark goes on first 'o'
	for (let i = 0; i < chars.length - 1; i++) {
		if (chars[i].toLowerCase() === 'o' && chars[i + 1].toLowerCase() === 'o') {
			// Skip if this 'o' already has a tone mark
			if (!hasToneMark(chars[i])) {
				return i;
			}
		}
	}

	// Check priority order: a > e > u > i > o
	for (const vowel of VOWEL_PRIORITY) {
		for (let i = 0; i < chars.length; i++) {
			if (chars[i].toLowerCase() === vowel && !hasToneMark(chars[i])) {
				// Special case: for 'ng', mark goes on 'n', not 'g'
				if (vowel === 'n' && i < chars.length - 1 && chars[i + 1].toLowerCase() === 'g') {
					// n followed by g - this is handled below
					continue;
				}
				return i;
			}
		}
	}

	// Check for standalone 'ng' or 'm' at end (when no other vowels)
	// These can also take tone marks
	for (let i = chars.length - 1; i >= 0; i--) {
		const char = chars[i].toLowerCase();
		// 'ng' as a unit - mark the 'n'
		if (char === 'n' && i < chars.length - 1 && chars[i + 1].toLowerCase() === 'g') {
			return i;
		}
		// Standalone 'm' at end
		if (char === 'm' && i === chars.length - 1) {
			return i;
		}
	}

	return -1;
}

// Check if a character already has a tone mark
function hasToneMark(char: string): boolean {
	const normalized = char.normalize('NFD');
	return /[\u0300-\u036f]/.test(normalized);
}

// Apply tone mark to a character
function applyToneMark(char: string, toneKey: string): string {
	const combiningMark = TONE_MARKS[toneKey];
	if (!combiningMark) return char;

	// Remove any existing tone marks first
	const base = char.normalize('NFD').replace(ALL_TONE_MARKS_REGEX, '');

	// Apply new tone mark
	return base + combiningMark;
}

// Process z and c consonant mappings (NOT f, which is handled separately)
// z -> ts, c -> tsh
function processConsonants(text: string): string {
	let result = '';
	const chars = [...text];

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		const lowerChar = char.toLowerCase();

		if (lowerChar === 'z') {
			result += char === 'Z' ? 'TS' : 'ts';
		} else if (lowerChar === 'c') {
			result += char === 'C' ? 'TSH' : 'tsh';
		} else {
			result += char;
		}
	}

	return result;
}

// Process f -> hyphen substitution (works even with tones present)
function processHyphen(text: string): { result: string; consumed: boolean } {
	// Look for 'f' at the end and convert it to hyphen
	// This should work regardless of whether there's a tone already
	if (text.endsWith('f') || text.endsWith('F')) {
		const base = text.slice(0, -1);
		return { result: base + '-', consumed: true };
	}
	return { result: text, consumed: false };
}

// Split text into syllables by delimiters (hyphen, space)
function splitIntoSyllables(text: string): string[] {
	// Split on hyphen or space, but keep the delimiters
	return text.split(/([-\s]+)/);
}

// Transform a single syllable based on Taiwanese Telex rules
function transformSyllable(syllable: string): { result: string; consumed: boolean } {
	// Check if this is a delimiter
	if (/^[-\s]+$/.test(syllable)) {
		return { result: syllable, consumed: false };
	}

	// First, check for hyphen substitution (f -> -)
	// This works even if there's already a tone on the syllable
	const hyphenResult = processHyphen(syllable);
	if (hyphenResult.consumed) {
		return hyphenResult;
	}

	// Apply consonant mappings (z -> ts, c -> tsh)
	let result = processConsonants(syllable);
	const consonantsTransformed = result !== syllable;

	// Check for tone keys at the end of the syllable
	const lastChar = result.slice(-1);
	if (lastChar in TONE_MARKS) {
		const toneKey = lastChar;
		const base = result.slice(0, -1);

		// Check if there's already a tone in the syllable
		const existingTonePos = findExistingTonePosition(base);

		if (existingTonePos !== -1) {
			// Replace existing tone with new one
			const chars = [...base];
			chars[existingTonePos] = applyToneMark(chars[existingTonePos], toneKey);
			result = chars.join('');
			return { result, consumed: true };
		} else {
			// Find where to place the tone mark (no existing tone)
			const pos = findTonePosition(base);
			if (pos !== -1) {
				const chars = [...base];
				chars[pos] = applyToneMark(chars[pos], toneKey);
				result = chars.join('');
				return { result, consumed: true };
			}
		}
	}

	// Check for inline tone keys (tone key immediately after a vowel)
	// We scan for patterns like av, ey, ow, etc.
	let transformed = result;
	let anyTransformed = false;

	for (let i = 0; i < transformed.length - 1; i++) {
		const current = transformed[i];
		const next = transformed[i + 1];

		if (isVowel(current) && next in TONE_MARKS) {
			const toneKey = next;

			// Check if there's already a tone somewhere in the syllable
			const existingTonePos = findExistingTonePosition(transformed);

			if (existingTonePos !== -1 && existingTonePos !== i) {
				// There's an existing tone on a different vowel - replace it
				const chars = [...transformed];
				// Remove old tone
				chars[existingTonePos] = getBaseVowel(chars[existingTonePos]);
				// Apply new tone to current vowel
				chars[i] = applyToneMark(chars[i], toneKey);
				// Remove the tone key
				chars.splice(i + 1, 1);
				transformed = chars.join('');
				anyTransformed = true;
			} else if (existingTonePos === i) {
				// Current vowel already has a tone - replace it
				const chars = [...transformed];
				chars[i] = applyToneMark(chars[i], toneKey);
				// Remove the tone key
				chars.splice(i + 1, 1);
				transformed = chars.join('');
				anyTransformed = true;
			} else {
				// No existing tone - apply new one
				const chars = [...transformed];
				chars[i] = applyToneMark(chars[i], toneKey);
				// Remove the tone key
				chars.splice(i + 1, 1);
				transformed = chars.join('');
				anyTransformed = true;
			}
		}
	}

	if (anyTransformed) {
		return { result: transformed, consumed: true };
	}

	// Return transformed result if consonants were converted, otherwise original
	return { result: consonantsTransformed ? result : syllable, consumed: consonantsTransformed };
}

// Transform text based on Taiwanese Telex input
export function transformTelex(text: string): { result: string; consumed: boolean } {
	const syllables = splitIntoSyllables(text);
	let transformed = '';
	let anyConsumed = false;

	for (const syllable of syllables) {
		const { result, consumed } = transformSyllable(syllable);
		transformed += result;
		if (consumed) anyConsumed = true;
	}

	return { result: transformed, consumed: anyConsumed };
}

// Process full input string iteratively
export function processTelexInput(input: string): string {
	let result = input;

	// Keep applying transformations until no more changes
	let changed = true;
	while (changed) {
		const { result: newResult, consumed } = transformTelex(result);
		if (consumed) {
			result = newResult;
		} else {
			changed = false;
		}
	}

	return result;
}

// Get tone position for visualization
export function getTonePosition(input: string): number {
	const syllables = splitIntoSyllables(input);
	if (syllables.length === 0) return -1;

	// Find position in the first syllable
	return findTonePosition(syllables[0]);
}

// Helper function to check if a string is a valid Taiwanese syllable
export function isValidSyllable(syllable: string): boolean {
	// A valid syllable should have at least one vowel (a, e, i, o, u, oo, ng, m)
	const normalized = syllable.toLowerCase();
	const hasVowel =
		/[aeiou]/.test(normalized) ||
		/oo/.test(normalized) ||
		/ng/.test(normalized) ||
		/m$/.test(normalized);
	return hasVowel;
}
