<script lang="ts">
    export let api;

    import { onMount } from "svelte";

    let deviceVersion = "Unknown";
    let deviceRuntime = "Unknown";

    onMount(async() => {
        if (!api) return;

        api.getVersion().then(data => {
			deviceVersion = JSON.stringify(data, null, 2);
		}).catch(reason => {
			console.warn('Fail to get version.', reason);
		});

		// get status
		api.getStatus().then(data => {
			data["mqtt"]["clientId"] = api.getClass().maskBemfaClientId(data["mqtt"]["clientId"]);
			deviceRuntime = JSON.stringify(data, null, 2);
		}).catch(reason => {
			console.warn('Fail to get status.', reason);
		});
    });
</script>

<style>
	.code {
		overflow-x: scroll;
		font-family: "Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", 'Courier New', Courier, monospace;
		white-space: pre;
		font-size: 12px;
        max-height: 120px;
        border: 1px solid lightgray;
        padding: 4px;
	}
</style>

<h2>System</h2>
<h3>Version</h3>
<p class="code">{deviceVersion}</p>
<h3>Runtime</h3>
<p class="code">{deviceRuntime}</p>
