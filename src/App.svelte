<script lang="ts">
	import _ from "underscore";
	import Api from "./api";

	import { watchResize } from "svelte-watch-resize";

	import TopAppBar, {Row, Section, Title} from "@smui/top-app-bar";
	import Button, {Label, Icon} from "@smui/button";
	import Textfield from "@smui/textfield";
	import HelperText from "@smui/textfield/helper-text/index";
	import Banner, {Label as BannerLabel, Icon as BannerIcon} from "@smui/banner";

	import Password from "./Password.svelte";
	import System from "./System.svelte";
	import Copyright from "./Copyright.svelte";

	import { onMount } from "svelte";

	// init api connection - TODO 要完成登录后，再初始化页面。
	let api = Api.createConnection('admin', '12345', 'http://192.168.31.103');
	console.debug(api);

	// bemfa config
	let bemfaConfig = {
		server: "bemfa.com",
		port: 9501,
		clientId: ""
	};

	let bemfaUi = _.clone(bemfaConfig);

	$: bemfaUiClientIdHelper = Api.maskBemfaClientId(bemfaUi.clientId);

	$: bemfaUpdated = (!_.isEqual(bemfaConfig, bemfaUi) && bemfaUi.server.trim() != "" && bemfaUi.clientId.trim() != "");

	function saveBemfa() {
		let cfg = {
			server: bemfaUi.server.trim(),
			port: bemfaUi.port,
			clientId: bemfaUi.clientId.trim()
		};

		api.putBemfaConfig(cfg).then(data => {
			bemfaConfig = _.clone(cfg);
			if (data.rebootRequired) {
				needReboot = true;
			}

			api._bemfaGetTopics(bemfaConfig.clientId).then(data => {
				console.log('Bemfa Mqtt Topics:', data);
			}).catch(reason => {
				console.warn('Get Bemfa Mqtt Topics failed.', reason);
			});
		}).catch(reason => {
			console.warn('Put Bemfa config fail.', reason);
		});
	}

	// ui
	let needReboot = false;

	function validateHost(value) {
		var re = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
		if (!re.test(value)) {
			console.debug('not match');
			return true;
		}
		return false;
	}

	function validatePort(value) {
		var re = /^[0-9]+$/;
		return (!_.isNumber(value)) || (value <= 0) || (value >= 65535) || (!re.test('' + value));
	}

	onMount(async() => {
		// update contentsDiv padding height
		updateContentsDivPaddingTop();

		// get bemfa config
		api.getBemfaConfig().then(data => {
			bemfaConfig = data;
			bemfaUi = _.clone(bemfaConfig);
		}).catch(reason => {
			console.warn('Fail to get bemfa config.', reason);
		});
	});

	let appBar;
	let contentsDiv;
	function updateContentsDivPaddingTop() {
		let appBarHeight = appBar.getElement().getBoundingClientRect().height;
		contentsDiv.style.paddingTop = '' + appBarHeight + 'px';
		console.debug('appBar height:', appBarHeight);
	}
</script>

<main>
	<TopAppBar bind:this={appBar} variant="fixed">
		<div use:watchResize="{updateContentsDivPaddingTop}">
			<Row>
				<Section>
					<Title>ESP8266 IR Gateway</Title>
				</Section>
			</Row>

			<div id="reboot-banner">
				<Banner
					open="{needReboot}" mobileStacked centered content$style="max-width: max-content;"
					on:MDCBanner:closed="{(event) => {needReboot=false;updateContentsDivPaddingTop();}}"
					on:MDCBanner:opened="{updateContentsDivPaddingTop}">

					<BannerIcon slot="icon" class="material-icons">info</BannerIcon>
					<BannerLabel slot="label">
						<!-- The configuration has been successfully saved. -->
						The device needs to be rebooted for the new configuration to take effect.
					</BannerLabel>
					<svelte:fragment slot="actions">
						<Button>
							<Icon class="material-icons">restart_alt</Icon>
							<Label>Reboot</Label>
						</Button>
					</svelte:fragment>
				</Banner>
			</div>
		</div>
	</TopAppBar>

	<div bind:this="{contentsDiv}" class="contents">
		<div class="card">
			<h2>Bemfa Cloud</h2>
			<div class="input-text" style="display:flex">
				<Textfield
					style="flex:auto"
					label="Server"
					required bind:value="{bemfaUi.server}"
					invalid="{validateHost(bemfaUi.server)}"
				/>
				<Textfield
					style="max-width:8ch; margin-left:5px"
					label="Port"
					type="number"
					required bind:value="{bemfaUi.port}"
					invalid="{validatePort(bemfaUi.port)}"
				/>
			</div>
			<Textfield class="input-text" label="Client ID" type="password" required bind:value="{bemfaUi.clientId}">
				<HelperText persistent slot="helper">{bemfaUiClientIdHelper}</HelperText>
			</Textfield>
			<div class="buttons">
				<Button disabled="{!bemfaUpdated}" on:click="{saveBemfa}"><Label>Save</Label></Button>
				<Button disabled="{!bemfaUpdated}" on:click="{e => bemfaUi = _.clone(bemfaConfig)}"><Label>Reset</Label></Button>
			</div>
		</div>

		<div class="card">
			<Password {api} on:saved="{() => {needReboot=true;}}" inputFieldClass="input-text" buttonsClass="buttons"/>
		</div>

		<div class="card">
			<System {api}/>
		</div>

		<Copyright owner="BG1REN" fromYear="2021"/>
	</div>
</main>

<style>
	main {
		text-align: left;
		padding: 0;
		margin: 0 auto;
	}

	#reboot-banner {
		color: #333;
	}

	.contents {
		max-width: 640px;
		padding: 0 20px 20px 20px;
		margin: 0 auto;
	}

	.card :global(.input-text) {
		min-width: 250px;
		width: 100%;
	}

	.card :global(.buttons) {
		text-align: right;
		white-space: nowrap;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
