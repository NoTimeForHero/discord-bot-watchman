<script>
    export let settings;

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
</script>

<div class="col-lg-12 text-center">
        <h1 class="mt-5">Требуется авторизация</h1>
        <p class="lead">Только участники сервера могут просматривать информацию о нём</p>	
        <a class="btn btn-primary btn-large" href="{getDiscordLink(settings)}">
            <i class="fab fa-discord"></i>			
            Войти через Discord
        </a>
</div>