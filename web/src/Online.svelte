<script>
	import { onMount } from 'svelte';
    import moment from 'moment';
    import 'moment/locale/ru';
    moment.locale('ru');

    let server = null;
    let users = null;     
    let filterRole = null;

    let filters = {
        role: null
    };

    $: getFilteredUsers = (users) => {
        if (!users) return [];
        return users.reduce((arr, user) => {
            if (filters.role) {
                const ids = user.roles.map(x => x.id);
                if (!ids.includes(filters.role.id)) return arr;
            }
            arr.push(user);
            return arr;
        }, []);
    }

        onMount(async()=>{
        const data = await fetch(window.urlAPI + 'online.json').then(x => x.json());
        users = data.users;
        server = data.server;

        console.log(users);
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
</style>

<div class="mt-5">
{#if users}
    <h2>Данные по онлайну сервера: {server.name}</h2>

    <div class="mt-3">
        {#if filters.role}
        <h4>
            Фильтрация:
            <a href='javascript:' style="border-color: {filters.role.hexColor}" class="mr-2 role" on:click='{() => filters.role = null}'>{filters.role.name}</a>            
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
            <td style='width: 200px'>
                <div class="user">
                    <img style='' src='{user.avatar}' alt='{user.name} avatar'/>
                    <span class='name' style="color: {user.color || 'white'}">{user.name}</span>
                </div>
                {moment(user.joinedAt).format('DD MMMM YYYY')}
            </td>
            <td>
                {#each user.roles as role}
                {#if role.name !== '@everyone'}
                <a href='javascript:' style="border-color: {role.hexColor}" class="mr-2 role"
                on:click='{() => filters.role = role}'>{role.name}</a>
                {/if}
                {/each}                
            </td>
            <td>
                <table>
                    <tr>
                        <td>Сегодня</td>
                        <th>5 минут</th>
                    </tr>
                    <tr>
                        <td>Неделя</td>
                        <th>5 минут</th>
                    </tr>
                    <tr>
                        <td>Был в сети</td>
                        <th>5 минут назад</th>
                    </tr>
                </table>
            </td>
            <td>
                <table>
                    <tr>
                        <td>Сегодня</td>
                        <th>5 минут</th>
                    </tr>
                    <tr>
                        <td>Неделя</td>
                        <th>5 минут</th>
                    </tr>
                    <tr>
                        <td>Был в сети</td>
                        <th>5 минут назад</th>
                    </tr>
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
        <div class="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
    </div>
{/if}
</div>