<script>
  import { onMount } from "svelte";
  let isLoading = true;
  let servers = [

  ];

  onMount(async()=>{

  });
</script>

<div class="col-lg-12 text-center">
  {#if !isLoading}
    <h1 class="mt-3 mb-3">Доступные сервера:</h1>
    {#each servers as server}
      <a class="btn btn-primary btn-large m-1" href="/view/{server.id}">
        {server.title}
      </a>
    {/each}
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
</div>
