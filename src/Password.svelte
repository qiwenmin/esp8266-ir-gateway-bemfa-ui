<script lang="ts">
	import Button, { Label } from "@smui/button";
	import Textfield from "@smui/textfield";

    import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    export let inputFieldClass = "";
    export let buttonsClass = "";

    export let api;

    let password = "";
    let confirmPassword = "";

    function savePassword() {
        if (!api) return;
        api.getVersion().then(data => {
            alert(JSON.stringify(data, null, 2));

            password = "";
            confirmPassword = "";

            dispatch('saved');
        }).catch(reason => {
            console.debug('Save password failed!', reason);
            dispatch('saveFail', reason);
        });
    }
</script>

<style>

</style>

<h2>Change Password</h2>
<Textfield class="{inputFieldClass}" label="Password" type="password" bind:value="{password}"/>
<Textfield class="{inputFieldClass}" label="Confirm" type="password" bind:value="{confirmPassword}"/>
<div class="{buttonsClass}">
    <Button disabled="{password==="" || (password !== confirmPassword)}" on:click="{savePassword}"><Label>Save</Label></Button>
    <Button disabled="{password===""}" on:click="{e => password=""}"><Label>Reset</Label></Button>
</div>
