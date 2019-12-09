<script>
  export let session;
  import axios from 'axios';
  import { onMount, createEventDispatcher } from "svelte";

  let error;
  let isLoading = true;
  let user = null;
  let servers = [];

  const dispatch = createEventDispatcher();
  onMount(async()=>{

    try {
      const response = await axios.get(window.urlAPI + 'servers', { headers: { 'X-Session': session }});
      user = response.data.user;
      servers = response.data.servers;
    } catch (ex) {
      error = ex.response && ex.response.data ? ex.response.data : ex.message;
    } finally {
      isLoading = false;      
    }

  });
</script>

<style>
.user_avatar {
  width: 120px;
}
.user_avatar img {
  width: 96px;
  height: 96px;
}
.user_name {
  font-weight: bold;
  font-size: 175%;
  margin-bottom: 5px;
}
.btn_logout {
  padding: 0.4em 0.8em;
}
</style>

<div class="col-lg-12 text-center mt-5">
  {#if !isLoading}
    <div class="row p-3 d-flex justify-content-center">
        <div class="user_avatar"><img src="{user.avatar}" alt="{user.name}" class=" rounded-circle"/></div>
        <div class="pl-3">
          <div class="user_name">{user.name}</div>
          <div>
            <button class="btn btn-danger btn_logout" on:click="{() => dispatch('logout', true)}">Выйти из аккаунта</button>          
          </div>        
        </div>
    </div>
    <div class="servers mb-4">
    {#each servers as server}
      <a class="btn btn-primary btn-large m-1" href="/view/{server.id}">
        {server.name}
      </a>  
    {/each}
    </div>    
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
