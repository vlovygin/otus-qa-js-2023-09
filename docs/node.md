# Node.js

## Node version manager

* <https://github.com/coreybutler/nvm-windows>
* <https://github.com/nvm-sh/nvm>

## Node package manager

Инициализация npm

```bash
npm init
```

Установка пакетов из package.json

```bash
npm install # установка пакетов последней версии
npm ci      # установка пакетов с версиями указанными в package-lock.json
```

Установка определенного пакета

```bash
npm -i jest
npm -i -g jest # install global
npm -i jest -D # install to dev dependencies
```

Список установелнных пакетов

```bash
npm list
npm list -g # global
```

## Node package executer

<https://www.npmjs.com/package/npx>

Запуск пакета без сохранения в package.json

```bash
npx webpack -- ...
npx eslint .
```
