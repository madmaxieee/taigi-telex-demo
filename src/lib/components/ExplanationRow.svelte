<script lang="ts">
	interface Props {
		key: string;
		tone: string;
		example: string;
		result: string;
	}

	let { key, tone, example, result }: Props = $props();
</script>

<tr class="bg-white">
	<td class="border border-slate-300 px-4 py-3 font-mono font-medium">{key}</td>
	<td class="border border-slate-300 px-4 py-3">{tone}</td>
	<td class="border border-slate-300 px-4 py-3 font-mono">{example}</td>
	<td class="border border-slate-300 px-4 py-3 font-mono">{result}</td>
</tr>
