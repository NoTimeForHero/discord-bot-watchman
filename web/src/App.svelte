<script>
	import { Router, Link, Route } from "svelte-routing";
	const discordLink = 'https://discordapp.com/api/oauth2/authorize?client_id=xxxxxxxxxxxxxxxxx&redirect_uri=http%3A%2F%2Flocalhost%3A5000&response_type=token&scope=identify';
	let url;
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
		<div class="col-lg-12 text-center">
			<h1 class="mt-5">Требуется авторизация</h1>
			<p class="lead">Только участники сервера могут просматривать информацию о нём</p>	
			<a class="btn btn-primary btn-large" href="{discordLink}">
				<i class="fab fa-discord"></i>			
				Войти через Discord
			</a>
		</div>
	</div>
</div>

<style>
.btn .fab {
	margin-right: 5px;
}
</style>