# Бот статистики онлайна Discord сервера

Собирает статистику о онлайне участников сервера и выводит её на запускаемом вместе с ботом веб-сервере.
Каждую минуту проверяет статус онлайна кажого участника сервера (включая голосовые каналы, не засчитывая AFK канал) и записывает её в БД.
Доступ к статистике имеет любой участник сервера.

---
**Осторожно!** Бот не тестировался на крупных серверах, с количеством участников больше 100!

## Требования:

1. Актуальная версия NodeJS
2. База данных Redis
3. (Опционально) PM2 для запуска в виде демона

## Установка:
1. Установить все необходимое ПО
2. Настроить settings.json (включая префикс для бота и ID админов для активации его на сервере)
3. Добавить бота на ваш Discord сервер
4. Ввести для начала сбора статистики команду: <prefix> server enable (не забудьте добавить свой ID пользователя в список админов!)
5. Открыть в браузере запущенный веб-сервер бота (по умолчанию на http://localhost:3000) и залогиниться 
