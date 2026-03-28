import { init, register, locale, getLocaleFromNavigator, isLoading } from 'svelte-i18n';
import { browser } from '$app/environment';

// Available languages
export const languages = [
	{ code: 'zh-TW', label: '華', name: '華語' },
	{ code: 'en', label: 'en', name: 'English' },
	{ code: 'nan', label: '臺', name: '臺語' }
];

// Store locale preference
const STORAGE_KEY = 'preferred-language';

function getStoredLocale(): string | null {
	if (!browser) return null;
	return localStorage.getItem(STORAGE_KEY);
}

function normalizeLocale(locale: string): string {
	// Map browser locales to our supported codes
	if (locale.startsWith('zh')) return 'zh-TW';
	if (locale.startsWith('en')) return 'en';
	if (locale.startsWith('nan') || locale.includes('TW') || locale.includes('tw')) return 'nan';
	return 'zh-TW'; // Default fallback
}

function getInitialLocale(): string {
	if (browser) {
		const stored = getStoredLocale();
		if (stored) return stored;
		const navigatorLocale = getLocaleFromNavigator();
		if (navigatorLocale) return normalizeLocale(navigatorLocale);
	}
	return 'zh-TW';
}

// Register locales
register('en', () => import('./locales/en.json'));
register('zh-TW', () => import('./locales/zh-TW.json'));
register('nan', () => import('./locales/nan.json'));

// Initialize i18n immediately for both server and client
init({
	fallbackLocale: 'zh-TW',
	initialLocale: getInitialLocale()
});

export function setStoredLocale(code: string) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, code);
	locale.set(code);
}

export { locale, isLoading };
