<script>
	import { onMount } from 'svelte';
	import { Router, Link, Route } from "svelte-routing";
	import axios from 'axios';

	import Auth from './Auth.svelte';
	import Online from './Online.svelte';
	import Servers from './Servers.svelte';

	let url;
	let isReady = false;
	let settings = null;	
	let session = null;

	function getDiscordLink(settings) {
		let params = {
			client_id: settings.bot.client_id,
			redirect_uri: settings.bot.redirect,
			response_type: 'token',
			scope: 'identify'
		};
		params = Object.entries(params).map( ([key,value]) => `${key}=${value}`).join('&');
		return 'https://discordapp.com/api/oauth2/authorize?' + params;
	}

	function setSession(event) {
		const data = event.detail;
		session = data.session;
		localStorage.setItem('session', session);
	}

	function delSession(event) {
		localStorage.removeItem('session');
		session = null;
	}

	onMount(async()=> {		
		session = localStorage.getItem('session');
		settings = await axios.get(window.urlAPI + 'settings.json').then(x => x.data);
		isReady = true;
	});

</script>

<div class="container">
	<div class="row">
		<div class="col-lg-12">
			{#if !isReady}
				<div class="mt-5 mb-3">
					<h3>Загрузка приложения</h3>
				</div>
				<div class="progress">
					<div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
				</div>
			{:else}
				{#if !session}
					<Auth settings="{settings}" on:login="{setSession}"/>
				{:else}
					<Router url="{url}">
						<Route path="/">
							<Servers session="{session}" on:logout="{delSession}" />
						</Route>
						<Route path="view/:id" let:params>
							<Online session="{session}" serverID="{params.id}"/>
						</Route>
					</Router>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
</style>