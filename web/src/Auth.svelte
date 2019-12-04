<script>
	import axios from 'axios';
	import { onMount, createEventDispatcher } from 'svelte';	
	export let settings;

	let isLoaded = false;
	let error;
	let anchor;
	
	const parseAnchor = (anchor) => anchor.substring(1, anchor.length)
		.split("&")
		.map(x => decodeURI(x))
		.map(x => x.replace(/\+/g, ' '))
		.reduce((arr, el)=>{
			const [key,value] = el.split("=");
			if (!key) return arr;
			arr[key] = value;
			return arr;
		}, {});	

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

	const dispatch = createEventDispatcher();	
	onMount(async ()=>{
		anchor = parseAnchor(window.location.hash);

		if (!anchor || Object.keys(anchor).length === 0) {
			isLoaded = true;
			return;
		}

		if (anchor.error) {
			error = anchor;
			isLoaded = true;
		}

		if (anchor.access_token) {
			try {
				const response = await axios.post(window.urlAPI + 'login', anchor);
				dispatch('login', response.data);
			} catch (ex) {
				error = ex.response && ex.response.data ? ex.response.data : ex.message;
			} finally {
				isLoaded = true;
			}
		}
		
		history.replaceState(null, null, location.pathname); // remove anchor?
	});
</script>

<div class="col-lg-12 text-center">
        <h1 class="mt-5">Требуется авторизация</h1>
        <p class="lead">Только участники сервера могут просматривать информацию о нём</p>	

		{#if error}
		<div class="alert alert-danger" role="alert">
			<strong>Ошибка {error.error?`(${error.error})`:''}</strong>: {error.error_description || error}
		</div>
		{/if}

		{#if !isLoaded}
			<div class="progress">
				<div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
			</div>		
		{:else}
			<a class="btn btn-primary btn-large" href="{getDiscordLink(settings)}">
				<i class="fab fa-discord"></i>			
				Войти через Discord
			</a>
		{/if}
</div>