<script>
	import { onMount } from 'svelte';
	import { Router, Link, Route } from "svelte-routing";

	import Auth from './Auth.svelte';
	import Online from './Online.svelte';

	let url;
	let isReady = false;
	let discordLink = 'kek';
	let settings = null;	

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

	onMount(async()=> {		
		settings = await fetch(window.urlAPI + 'settings.json').then(x => x.json());
		isReady = true;
	});

</script>

<!--
<Router url="{url}">
<nav>
	<Link to="/">Home</Link>
	<Link to="test1">About</Link>
	<Link to="test2">Blog</Link>
</nav>
<div>
	<Route path="/"><h1>Main page</h1></Route>
	<Route path="test1" component="{Test1}" />		
	<Route path="test2" component="{Test2}" />		
</div>
</Router>
-->
<!-- Page Content -->
<div class="container">
	<div class="row">
		<div class="col-lg-12">
			{#if !isReady}
				<div class="mt-5 mb-3">
					<h3>Загрузка приложения</h3>
				</div>
				<div class="progress">
					<div class="progress-bar progress-bar-striped progress-bar-animated"
						role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
				</div>
			{:else}
				<!--<Auth class="text-center" settings="{settings}"/>-->
				<Online settings="{settings}" />
			{/if}
		</div>
	</div>
</div>

<style>
.btn .fab {
	margin-right: 5px;
}
</style>