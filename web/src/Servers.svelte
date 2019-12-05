<script>
  export let session;
  import axios from 'axios';
  import { onMount, createEventDispatcher } from "svelte";

  let error;
  let isLoading = true;
  let servers = [];

  const dispatch = createEventDispatcher();
  onMount(async()=>{

    try {
      const response = await axios.get(window.urlAPI + 'servers', { headers: { 'X-Session': session }});
      servers = response.data.servers;
    } catch (ex) {
      error = ex.response && ex.response.data ? ex.response.data : ex.message;
    } finally {
      isLoading = false;      
    }

  });
</script>

<div class="col-lg-12 text-center">
  {#if !isLoading}
    <h1 class="mt-3 mb-3">Доступные сервера:</h1>
    <div class="servers mb-4">
    {#each servers as server}
      <a class="btn btn-primary btn-large m-1" href="/view/{server.id}">
        {server.name}
      </a>
    {/each}
    </div>    
    <button class="btn btn-danger" on:click="{() => dispatch('logout', true)}">Выйти из аккаунта</button>
  {:else}
    <div class="mt-5 mb-3">
      <h3>Загрузка списка доступных вам серверов</h3>
    </div>
    <div class="progress">
      <div
        class="progress-bar progress-bar-striped progress-bar-animated"
        role="progressbar"
        style="width: 100%" />
    </div>
  {/if}
		{#if error}
		<div class="alert alert-danger mt-3" role="alert">
			<strong>Ошибка</strong>: {JSON.stringify(error)}
		</div>
		{/if}  
</div>
