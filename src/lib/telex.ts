// Taiwanese Telex transformation logic for Tâi-lô (TL) and Pe̍h-ōe-jī (POJ) romanization

export type Mode = 'tl' | 'poj';

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

// Combining dot above right for POJ o͘
const COMBINING_DOT_ABOVE_RIGHT = '\u0358';

// Superscript n for POJ nasalization
const SUPER_SCRIPT_N = '\u207F';

// Vowel priority for tone placement
// TL: a > e > o > u > i
// POJ: o͘ > a > e > o > u > i
const VOWEL_PRIORITY_TL = ['a', 'e', 'o', 'u', 'i'];
const VOWEL_PRIORITY_POJ = ['o', 'a', 'e', 'u', 'i']; // o͘ is handled specially

// Check if character is a vowel (base form)
function isVowel(char: string, mode: Mode = 'tl'): boolean {
	const priority = mode === 'poj' ? VOWEL_PRIORITY_POJ : VOWEL_PRIORITY_TL;
	return priority.includes(char.toLowerCase());
}

// Get the base vowel character (without tone marks)
function getBaseVowel(char: string): string {
	return char.normalize('NFD').replace(ALL_TONE_MARKS_REGEX, '');
}

// Check if character is o with dot above right (POJ-specific)
function isODotAboveRight(char: string): boolean {
	const normalized = char.normalize('NFD');
	return normalized.includes('o') && normalized.includes(COMBINING_DOT_ABOVE_RIGHT);
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
function findTonePosition(syllable: string, mode: Mode = 'tl'): number {
	const chars = [...syllable]; // Use spread for proper Unicode handling

	// POJ mode: o͘ has highest priority
	if (mode === 'poj') {
		for (let i = 0; i < chars.length; i++) {
			if (isODotAboveRight(chars[i]) && !hasToneMark(chars[i])) {
				return i;
			}
		}

		// Handle POJ-specific exceptions: eo -> mark on e, oe -> mark on o
		for (let i = 0; i < chars.length - 1; i++) {
			const char1 = chars[i].toLowerCase();
			const char2 = chars[i + 1].toLowerCase();

			// 'eo' - mark goes on 'e'
			if (char1 === 'e' && char2 === 'o') {
				if (!hasToneMark(chars[i])) {
					return i;
				}
			}
			// 'oe' - mark goes on 'o'
			if (char1 === 'o' && char2 === 'e') {
				if (!hasToneMark(chars[i])) {
					return i;
				}
			}
		}
	}

	// TL mode: Check for 'oo' vowel - mark goes on first 'o'
	if (mode === 'tl') {
		for (let i = 0; i < chars.length - 1; i++) {
			if (chars[i].toLowerCase() === 'o' && chars[i + 1].toLowerCase() === 'o') {
				// Skip if this 'o' already has a tone mark
				if (!hasToneMark(chars[i])) {
					return i;
				}
			}
		}
	}

	// Check for composite vowel exceptions:
	// 'iu' -> mark goes on 'u', 'ui' -> mark goes on 'i'
	for (let i = 0; i < chars.length - 1; i++) {
		const char1 = chars[i].toLowerCase();
		const char2 = chars[i + 1].toLowerCase();

		// 'ui' - mark goes on 'i' (not 'u' as priority would suggest)
		if (char1 === 'u' && char2 === 'i') {
			if (!hasToneMark(chars[i + 1])) {
				return i + 1;
			}
		}
		// 'iu' - mark goes on 'u' (consistent with priority, but explicit for clarity)
		if (char1 === 'i' && char2 === 'u') {
			if (!hasToneMark(chars[i + 1])) {
				return i + 1;
			}
		}
	}

	// Check priority order
	const priority = mode === 'poj' ? VOWEL_PRIORITY_POJ : VOWEL_PRIORITY_TL;
	for (const vowel of priority) {
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

// Process consonant mappings based on mode
// TL: z -> ts, c -> tsh
// POJ: z -> ch, c -> chh
function processConsonants(text: string, mode: Mode = 'tl'): string {
	let result = '';
	const chars = [...text];

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		const lowerChar = char.toLowerCase();

		if (lowerChar === 'z') {
			if (mode === 'poj') {
				result += char === 'Z' ? 'Ch' : 'ch';
			} else {
				result += char === 'Z' ? 'Ts' : 'ts';
			}
		} else if (lowerChar === 'c') {
			if (mode === 'poj') {
				result += char === 'C' ? 'Chh' : 'chh';
			} else {
				result += char === 'C' ? 'Tsh' : 'tsh';
			}
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

// Process POJ-specific features
// nn -> ⁿ (superscript n)
// oo -> o͘ (o with dot below)
// nnn -> nn (escape sequence)
// ooo -> oo (escape sequence)
function processPOJFeatures(text: string): { result: string; consumed: boolean } {
	// Check for escape sequences first (nnn -> nn, ooo -> oo)
	// We need to track which n's/o's are part of escapes
	const chars = [...text];
	let result = '';
	let i = 0;
	let consumed = false;

	while (i < chars.length) {
		const char = chars[i];
		const lowerChar = char.toLowerCase();

		// Check for nnn or ooo escape sequences
		if (i + 2 < chars.length) {
			const next1 = chars[i + 1];
			const next2 = chars[i + 2];

			// nnn -> nn (escape)
			if (lowerChar === 'n' && next1.toLowerCase() === 'n' && next2.toLowerCase() === 'n') {
				result += char + next1; // Keep literal 'nn'
				i += 3;
				consumed = true;
				continue;
			}

			// ooo -> oo (escape)
			if (lowerChar === 'o' && next1.toLowerCase() === 'o' && next2.toLowerCase() === 'o') {
				result += char + next1; // Keep literal 'oo'
				i += 3;
				consumed = true;
				continue;
			}
		}

		// Check for nn -> ⁿ (but not if followed by another n, which we already handled)
		if (lowerChar === 'n' && i + 1 < chars.length && chars[i + 1].toLowerCase() === 'n') {
			// Check if this is at a word boundary or followed by non-letter
			const nextNext = chars[i + 2];
			if (!nextNext || !/[a-zA-Z]/.test(nextNext)) {
				result += SUPER_SCRIPT_N;
				i += 2;
				consumed = true;
				continue;
			}
		}

		// Check for oo -> o͘ (but not if followed by another o, which we already handled)
		if (lowerChar === 'o' && i + 1 < chars.length && chars[i + 1].toLowerCase() === 'o') {
			// Check if this is at a word boundary or followed by non-letter
			const nextNext = chars[i + 2];
			if (!nextNext || !/[a-zA-Z]/.test(nextNext)) {
				// Apply dot above right to 'o'
				const baseO = char === 'O' ? 'O' : 'o';
				result += baseO + COMBINING_DOT_ABOVE_RIGHT;
				i += 2;
				consumed = true;
				continue;
			}
		}

		result += char;
		i++;
	}

	return { result, consumed };
}

// Split text into syllables by delimiters (hyphen, space)
function splitIntoSyllables(text: string): string[] {
	// Split on hyphen or space, but keep the delimiters
	return text.split(/([-\s]+)/);
}

// Transform a single syllable based on Taiwanese Telex rules
function transformSyllable(
	syllable: string,
	mode: Mode = 'tl'
): { result: string; consumed: boolean } {
	// Check if this is a delimiter
	if (/^[-\s]+$/.test(syllable)) {
		return { result: syllable, consumed: false };
	}

	let result = syllable;
	let anyConsumed = false;

	// First, check for hyphen substitution (f -> -)
	// This works even if there's already a tone on the syllable
	const hyphenResult = processHyphen(syllable);
	if (hyphenResult.consumed) {
		return hyphenResult;
	}

	// Apply POJ-specific features first (nn -> ⁿ, oo -> o͘)
	if (mode === 'poj') {
		const pojResult = processPOJFeatures(result);
		if (pojResult.consumed) {
			result = pojResult.result;
			anyConsumed = true;
		}
	}

	// Apply consonant mappings (z -> ts/ch, c -> tsh/chh)
	const consonantsResult = processConsonants(result, mode);
	const consonantsTransformed = consonantsResult !== result;
	if (consonantsTransformed) {
		result = consonantsResult;
		anyConsumed = true;
	}

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
			const pos = findTonePosition(base, mode);
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

		if (isVowel(getBaseVowel(current), mode) && next in TONE_MARKS) {
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

	// Return transformed result if any transformations occurred
	return { result, consumed: anyConsumed };
}

// Transform text based on Taiwanese Telex input
export function transformTelex(
	text: string,
	mode: Mode = 'tl'
): { result: string; consumed: boolean } {
	const syllables = splitIntoSyllables(text);
	let transformed = '';
	let anyConsumed = false;

	for (const syllable of syllables) {
		const { result, consumed } = transformSyllable(syllable, mode);
		transformed += result;
		if (consumed) anyConsumed = true;
	}

	return { result: transformed, consumed: anyConsumed };
}

// Process full input string iteratively
export function processTelexInput(input: string, mode: Mode = 'tl'): string {
	let result = input;

	// Keep applying transformations until no more changes
	let changed = true;
	while (changed) {
		const { result: newResult, consumed } = transformTelex(result, mode);
		if (consumed) {
			result = newResult;
		} else {
			changed = false;
		}
	}

	return result;
}

// Get tone position for visualization
export function getTonePosition(input: string, mode: Mode = 'tl'): number {
	const syllables = splitIntoSyllables(input);
	if (syllables.length === 0) return -1;

	// Find position in the first syllable
	return findTonePosition(syllables[0], mode);
}

// Helper function to check if a string is a valid Taiwanese syllable
export function isValidSyllable(syllable: string, mode: Mode = 'tl'): boolean {
	// A valid syllable should have at least one vowel (a, e, i, o, u, oo, ng, m, or o͘/ⁿ in POJ)
	const normalized = syllable.toLowerCase();
	const hasVowel =
		/[aeiou]/.test(normalized) ||
		/oo/.test(normalized) ||
		/ng/.test(normalized) ||
		/m$/.test(normalized);

	if (mode === 'poj') {
		const hasPOJVowel =
			normalized.includes('o' + COMBINING_DOT_ABOVE_RIGHT) || normalized.includes(SUPER_SCRIPT_N);
		return hasVowel || hasPOJVowel;
	}

	return hasVowel;
}

// Default export for convenience
export default {
	transformTelex,
	processTelexInput,
	getTonePosition,
	isValidSyllable
};
