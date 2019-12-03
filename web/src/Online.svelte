<script> 
  export let serverID;
  import { onMount } from "svelte";
  import moment from "moment";
  import "moment/locale/ru";
  moment.locale("ru");

  import humanizeDuration from 'humanize-duration';
  
  const humanizer = humanizeDuration.humanizer({ language: 'ru', round: true, delimiter: ' '})

  let server = null;
  let users = null;
  let filterRole = null;

  let filters = {
    role: null
  };

  $: getFilteredUsers = users => {
    if (!users) return [];
    return users.reduce((arr, user) => {
      if (filters.role) {
        const ids = user.roles.map(x => x.id);
        if (!ids.includes(filters.role.id)) return arr;
      }
      arr.push(user);
      return arr;
    }, []);
  };

  const applyOnline = (data) => {
    const year = moment().format('YYYY');
    const dayNo = moment().dayOfYear();
    const weekNo = moment().week();

    return (id) => {
        const current = data[id];
        if (!current) return {};
        // TODO: Переписать эту жесть на стороне сервера
        return ['online', 'voice'].reduce((arr, prop)=>{
            arr[prop] = {
                day: current.days[year] && current.days[year][dayNo] && current.days[year][dayNo][prop] ? current.days[year][dayNo][prop] : undefined,
                week: current.weeks[year] && current.weeks[year][weekNo] && current.weeks[year][weekNo][prop] ? current.weeks[year][weekNo][prop] : undefined,
                last: current[prop]
            };
            return arr;
        }, {});
    }      
  }

  onMount(async () => {
    const getData = fetch(window.urlAPI + "server/" + serverID).then(x => x.json());
    const getOnline = fetch(window.urlAPI + "online/" + serverID).then(x => x.json());

    const [data, online] = await Promise.all([getData, getOnline]);
    const userOnline = applyOnline(online);

    users = data.users.map(user => Object.assign(user, userOnline(user.id)));
    server = data.server;
  });
</script>

<style>
  .role {
    border: 1px solid #000;
    border-radius: 11px;
    padding: 6px 5px;
    height: 22px;
  }
  .user {
    margin-bottom: 5px;
  }

  .user .name {
    font-weight: bold;
    text-shadow: 1px 1px 0px black;
  }

  .user img {
    width: 32px;
    height: 32px;
    border-radius: 50px;
    margin-right: 5px;
  }

  table.noborder td, table.noborder th {
      border:none;
  }
</style>

<div class="mt-5">
  {#if users}
    <h2>Данные по онлайну сервера: {server.name}</h2>

    <div class="mt-3">
      {#if filters.role}
        <h4>
          Фильтрация:
          <a
            href="javascript:"
            style="border-color: {filters.role.hexColor}"
            class="mr-2 role"
            on:click={() => (filters.role = null)}>
            {filters.role.name}
          </a>
        </h4>
      {/if}
    </div>

    <table class="table table-hover mt-4">
      <thead class="thead-light">
        <tr>
          <th>Пользователь</th>
          <th>Роли</th>
          <th>Онлайн</th>
          <th>Голосовой чат</th>
        </tr>
      </thead>
      {#each getFilteredUsers(users) as user}
        <tr>
          <td style="width: 200px">
            <div class="user">
              <img style="" src={user.avatar} alt="{user.name} avatar" />
              <span class="name" style="color: {user.color || 'white'}">
                {user.name}
              </span>
            </div>
            {moment(user.joinedAt).format('DD MMMM YYYY')}
          </td>
          <td>
            {#each user.roles as role}
              {#if role.name !== '@everyone'}
                <a
                  href="javascript:"
                  style="border-color: {role.hexColor}"
                  class="mr-2 role"
                  on:click={() => (filters.role = role)}>
                  {role.name}
                </a>
              {/if}
            {/each}
          </td>
          <td>     
            <table class="noborder">
              {#if user.online}     
              <tr>
                <td>Сегодня</td>
                <th>{user.online.day ? humanizer(user.online.day*1000) : 'неизвестно'}</th>
              </tr>
              <tr>
                <td>Неделя</td>
                <th>{user.online.week ? humanizer(user.online.week*1000) : 'неизвестно'}</th>
              </tr>
              <tr>
                <td>Был в сети</td>
                <th>{user.online.last ? moment(user.online.last).fromNow() : 'неизвестно'}</th>
              </tr>
            {:else}           
            <tr>
                <th><h4>Нет данных</h4></th>
            </tr>
            {/if}                
            </table>          
          </td>
          <td>
            <table class="noborder">
              {#if user.voice}            
              <tr>
                <td>Сегодня</td>
                <th>{user.voice.day ? humanizer(user.voice.day*1000) : 'неизвестно'}</th>
              </tr>
              <tr>
                <td>Неделя</td>
                <th>{user.voice.week ? humanizer(user.voice.week*1000) : 'неизвестно'}</th>
              </tr>
              <tr>
                <td>Был в сети</td>
                <th>{user.voice.last ? moment(user.voice.last).fromNow() : 'неизвестно'}</th>
              </tr>
                {:else}           
                <tr>
                    <th><h4>Нет данных</h4></th>
                </tr>
                {/if}                   
            </table>
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    <div class="mt-5 mb-3">
      <h3>Загрузка данных об онлайне</h3>
    </div>
    <div class="progress">
      <div
        class="progress-bar progress-bar-striped progress-bar-animated"
        role="progressbar"
        aria-valuenow="75"
        aria-valuemin="0"
        aria-valuemax="100"
        style="width: 100%" />
    </div>
  {/if}
</div>
