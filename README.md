<p align="center">
  <h1 align="center">🧩 Chat JS Runner</h1>
  <p align="center">
    <b>SillyTavern Extension</b> — Live HTML/JS rendering inside chat messages
    <br/>
    <i>Расширение для SillyTavern — живой рендеринг HTML/JS прямо в сообщениях чата</i>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version"/>
    <img src="https://img.shields.io/badge/platform-SillyTavern-purple?style=flat-square" alt="Platform"/>
    <img src="https://img.shields.io/badge/license-GPL--3.0-green?style=flat-square" alt="License"/>
    <img src="https://img.shields.io/badge/author-itsfantomas-orange?style=flat-square" alt="Author"/>
  </p>
</p>

---

> **🇬🇧 English** | [🇷🇺 Русский](#-русская-версия)

---

## 📖 Overview

**Chat JS Runner** is a third-party extension for [SillyTavern](https://github.com/SillyTavern/SillyTavern) that automatically detects HTML/JavaScript code blocks inside chat messages and renders them as **interactive, sandboxed iframes** — directly in the message bubble.

Instead of seeing raw code, you see the **live result**: buttons, animations, mini-games, styled cards, dashboards — anything an LLM can generate as HTML.

### 💡 Key Idea

You describe the visual you want in your prompt → the AI writes HTML/CSS/JS inside a code block → **Chat JS Runner** renders it instantly inside the chat, replacing the raw code with a working widget.

---

## ✨ Features

| Feature                       | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| 🖥️ **Live Preview**           | Code blocks are rendered as working web pages in real-time                 |
| 📦 **Sandboxed Execution**    | All code runs inside `<iframe>` — isolated from SillyTavern's own UI       |
| 🔍 **Auto-Detection**         | Triggers on `<!DOCTYPE html>`, `<style>`, or the `RUN-ME` keyword          |
| 📐 **Auto-Resize**            | Iframes dynamically adjust height using `ResizeObserver` + `postMessage`   |
| 🔄 **Manual Resize**          | Users can drag the iframe corner to resize vertically                      |
| 👁 **Show Source Code**        | Toggle button lets you reveal/hide the original code block                 |
| ⚡ **Stream-Safe**            | Ignores code blocks shorter than 50 characters (protects during streaming) |
| 🧹 **No Duplicate Rendering** | Processed blocks are marked with `.js-executed` to prevent re-rendering    |
| ⚙️ **Toggle On/Off**          | Simple checkbox in SillyTavern's extension settings panel                  |

---

## 🛠️ Technology Stack & Architecture

### Technologies Used

| Technology                  | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| **JavaScript (ES Modules)** | Core logic — imported into ST's extension system             |
| **jQuery**                  | DOM manipulation and event handling (ST's native dependency) |
| **MutationObserver API**    | Watches the `#chat` container for new messages in real-time  |
| **ResizeObserver API**      | Tracks content height changes inside iframes                 |
| **postMessage API**         | Cross-origin communication between iframe and parent window  |
| **iframe (srcdoc)**         | Sandboxed execution environment for user-generated HTML      |
| **HTML / CSS**              | Settings panel UI and iframe template styling                |

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                   SillyTavern UI                     │
│                                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │              #chat Container                    │  │
│  │                                                 │  │
│  │  ┌─────────────────────────────┐                │  │
│  │  │     Message Bubble          │                │  │
│  │  │  ┌───────────────────────┐  │                │  │
│  │  │  │ <pre><code> block     │◄─┼── Detected by  │  │
│  │  │  │ (hidden after render) │  │   MutationObs. │  │
│  │  │  └───────────────────────┘  │                │  │
│  │  │  ┌───────────────────────┐  │                │  │
│  │  │  │  👁 Show Source Code  │  │  Toggle button │  │
│  │  │  └───────────────────────┘  │                │  │
│  │  │  ┌───────────────────────┐  │                │  │
│  │  │  │  <iframe srcdoc="…">  │  │  Rendered      │  │
│  │  │  │  ┌─────────────────┐  │  │  widget        │  │
│  │  │  │  │  Live HTML/JS   │  │  │                │  │
│  │  │  │  │  (sandboxed)    │  │  │                │  │
│  │  │  │  └─────────────────┘  │  │                │  │
│  │  │  └───────────────────────┘  │                │  │
│  │  └─────────────────────────────┘                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                      │
│  MutationObserver ──► scanAndExecuteScripts()        │
│       │                     │                        │
│       ▼                     ▼                        │
│  Watches #chat       createInteractiveFrame()        │
│  for new DOM nodes   ──► iframe + ResizeObserver     │
└──────────────────────────────────────────────────────┘
```

### Module Breakdown (`index.js`)

The source is organized into **5 logical sections**:

| #   | Section             | Lines   | Description                                                                                                                                                          |
| --- | ------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Settings Logic**  | 15–31   | Loads/saves the "enabled" checkbox state via ST's `extension_settings` API                                                                                           |
| 2   | **Iframe Factory**  | 33–133  | `createInteractiveFrame(content)` — builds a sandboxed iframe with auto-resize, dark-theme scrollbars, responsive media, and height constraints (`max-height: 80vh`) |
| 3   | **Execution Logic** | 136–200 | `scanAndExecuteScripts()` — scans all `<pre><code>` blocks in `#chat`, detects trigger keywords, creates iframes, inserts toggle buttons                             |
| 4   | **Observer Logic**  | 204–228 | `toggleObserver(isEnabled)` — starts/stops a `MutationObserver` on `#chat` to react to new messages                                                                  |
| 5   | **Initialization**  | 230–247 | jQuery entry point — loads `settings.html`, binds events, starts observer after a 1-second delay                                                                     |

---

## 📥 Installation

### Method 1: Git Clone (Recommended)

1. Navigate to your SillyTavern extensions directory:

   ```bash
   cd SillyTavern/public/scripts/extensions/third-party/
   ```

2. Clone the repository:

   ```bash
   git clone https://github.com/itsfantomas/chat-js-runner.git
   ```

3. Restart SillyTavern (or reload the page).

4. Enable the extension in **Extensions** → **Chat JS Runner** → ☑️ _Enable JavaScript Execution_.

### Method 2: Manual Download

1. Download the [latest release](https://github.com/itsfantomas/chat-js-runner/archive/refs/heads/main.zip).
2. Extract the archive into `SillyTavern/public/scripts/extensions/third-party/chat-js-runner/`.
3. Restart SillyTavern and enable the extension.

---

## 🚀 Usage

The extension works **automatically**. Once enabled, any code block in chat that contains one of the trigger keywords will be rendered.

### Trigger Keywords

The extension detects code blocks containing **any** of these markers:

| Trigger           | When to use                                                 |
| ----------------- | ----------------------------------------------------------- |
| `<!DOCTYPE html>` | Standard HTML pages                                         |
| `<style>`         | CSS-styled content                                          |
| `RUN-ME`          | Explicit render marker (use in comments: `<!-- RUN-ME -->`) |

### Basic Example

Write this in chat (or have the AI generate it):

````
```html
<!DOCTYPE html>
<html>
<body style="background: linear-gradient(135deg, #667eea, #764ba2);
             display: flex; align-items: center; justify-content: center;
             height: 100vh; margin: 0;">
  <button onclick="this.textContent = '✨ It works!'"
          style="padding: 20px 40px; font-size: 18px; border: none;
                 border-radius: 12px; cursor: pointer;
                 background: white; color: #764ba2;">
    Click Me
  </button>
</body>
</html>
```
````

**Result:** Instead of raw code, you'll see a live button with a gradient background directly in the chat bubble.

---

## 🎯 Writing Prompts for Preset Toggles — Tips & Best Practices

If you want the AI to consistently generate renderable widgets, add instructions to your **preset toggle** (system prompt, jailbreak, or author's note). Below are professional tips:

### 1. Basic Integration Prompt

Add this to your **System Prompt** or **Toggle Preset**:

```
When I ask for a visual element, widget, interface, or any visual representation,
generate the COMPLETE HTML code inside a markdown code block. Requirements:
- Always start with <!DOCTYPE html>
- Include ALL styles inline or in a <style> tag (no external CSS files)
- Include ALL scripts inline (no external JS files)
- The page must be fully self-contained and functional
- Use dark background colors (the chat has a dark theme)
- Make text white or light-colored for readability
```

### 2. Advanced Prompt for Interactive Widgets

```
When generating visual interfaces:
1. Wrap everything in <!DOCTYPE html> with complete <html><head><body> structure
2. All CSS must be in a <style> tag inside <head> — no external links
3. All JavaScript must be in <script> tags — no external libraries unless via CDN
4. Use responsive design: max-width: 100%, viewport-relative units
5. Assume dark background (#1a1a2e or similar) — use light text colors
6. Add smooth animations with CSS transitions/keyframes for a polished look
7. Make interactive elements have hover effects
8. Keep the total code under 500 lines for optimal rendering performance
```

### 3. Trigger-Specific Tips

| Scenario                      | Prompt Suggestion                                                   |
| ----------------------------- | ------------------------------------------------------------------- |
| **Status cards / dashboards** | _"Create an HTML dashboard with stats as a styled card grid"_       |
| **Mini-games**                | _"Build a small browser game in a single HTML file with inline JS"_ |
| **Character sheets**          | _"Render a character sheet as a styled HTML page with dark theme"_  |
| **Timers / clocks**           | _"Create an animated digital clock using HTML and CSS"_             |
| **Interactive maps**          | _"Generate an SVG-based interactive map inside an HTML document"_   |

### 4. Common Mistakes to Avoid

> [!WARNING]
>
> - ❌ **External dependencies** — `<link href="bootstrap.css">` will NOT load inside the iframe. Use inline styles.
> - ❌ **Missing `<!DOCTYPE html>`** — Without a trigger keyword, the code block will not be rendered.
> - ❌ **Code too short** — Blocks under 50 characters are skipped (stream protection).
> - ❌ **`localStorage` / `fetch` calls** — The sandboxed iframe has limited access to browser APIs.
> - ✅ **CDN links work** — `<script src="https://cdn.example.com/lib.js">` loads normally via `srcdoc`.

### 5. Recommended Prompt Presets

<details>
<summary>📋 Universal Widget Preset (click to expand)</summary>

```
[System Note: Interactive Rendering]
When the user requests any visual, interface, dashboard, card, game or animated
element, you MUST generate it as a complete, self-contained HTML document.

Mandatory structure:
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>/* all styles here */</style>
</head>
<body>
    <!-- content here -->
    <script>/* all scripts here */</script>
</body>
</html>

Design rules:
- Dark theme: background #0d1117, text #e6edf3
- Accent colors: neon tones (#58a6ff, #f78166, #7ee787)
- Rounded corners (border-radius: 12px)
- Subtle box-shadows for depth
- Smooth CSS transitions on interactive elements
- Responsive: use %, vw/vh, clamp() — no fixed pixel widths
- All assets must be inline (SVG, base64, or CSS-drawn)
```

</details>

---

## 📁 Project Structure

```
chat-js-runner/
├── index.js          # Core extension logic (settings, iframe factory, observer)
├── manifest.json     # SillyTavern extension manifest (metadata, entry points)
├── settings.html     # Settings panel HTML (enable/disable checkbox)
├── style.css         # Reserved for future custom styles
└── LICENSE           # GPL-3.0 License
```

---

## ⚠️ Security Considerations

| Aspect                     | Details                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| **Sandbox**                | Code runs in an `<iframe>` with `srcdoc`, providing DOM isolation from SillyTavern                 |
| **No `sandbox` attribute** | The iframe does NOT use the HTML `sandbox` attribute, so scripts have full access within the frame |
| **Client-side only**       | All execution happens in the browser — no server-side code execution                               |
| **Risk**                   | A malicious prompt could generate JS that accesses `window.parent` or makes network requests       |
| **Mitigation**             | Only enable the extension with trusted AI models/prompts. Toggle it off when not needed            |

> [!CAUTION]
> This extension executes arbitrary HTML and JavaScript from AI-generated messages. While iframe isolation provides a basic safety layer, it is **not** a full security sandbox. Use with caution and only enable when you specifically need widget rendering.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or pull requests on [GitHub](https://github.com/itsfantomas/chat-js-runner).

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

---

---

<h1 align="center" id="-русская-версия">🇷🇺 Русская версия</h1>

---

## 📖 Обзор

**Chat JS Runner** — это стороннее расширение для [SillyTavern](https://github.com/SillyTavern/SillyTavern), которое автоматически находит блоки HTML/JavaScript-кода в сообщениях чата и отображает их как **интерактивные изолированные iframe** — прямо внутри пузыря сообщения.

Вместо сырого кода вы видите **живой результат**: кнопки, анимации, мини-игры, стилизованные карточки, дашборды — всё, что LLM может сгенерировать в виде HTML.

### 💡 Ключевая идея

Вы описываете желаемый визуал в промпте → ИИ пишет HTML/CSS/JS внутри блока кода → **Chat JS Runner** мгновенно рендерит это в чате, заменяя сырой код работающим виджетом.

---

## ✨ Возможности

| Возможность                 | Описание                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| 🖥️ **Живой предпросмотр**   | Кодовые блоки рендерятся как работающие веб-страницы в реальном времени                       |
| 📦 **Изоляция**             | Весь код выполняется внутри `<iframe>` — изолирован от UI SillyTavern                         |
| 🔍 **Авто-определение**     | Срабатывает на `<!DOCTYPE html>`, `<style>` или ключевое слово `RUN-ME`                       |
| 📐 **Авто-ресайз**          | Iframe динамически подстраивает высоту через `ResizeObserver` + `postMessage`                 |
| 🔄 **Ручной ресайз**        | Пользователь может тянуть iframe за угол для изменения размера                                |
| 👁 **Показать исходный код** | Кнопка-переключатель для отображения/скрытия оригинального кода                               |
| ⚡ **Защита при стриминге** | Игнорирует блоки кода короче 50 символов (защита при потоковой генерации)                     |
| 🧹 **Без дублирования**     | Обработанные блоки помечаются классом `.js-executed` для предотвращения повторного рендеринга |
| ⚙️ **Вкл/Выкл**             | Простой чекбокс в панели настроек расширений SillyTavern                                      |

---

## 🛠️ Стек технологий и архитектура

### Используемые технологии

| Технология                  | Назначение                                                     |
| --------------------------- | -------------------------------------------------------------- |
| **JavaScript (ES Modules)** | Основная логика — импортируется в систему расширений ST        |
| **jQuery**                  | Манипуляция DOM и обработка событий (нативная зависимость ST)  |
| **MutationObserver API**    | Отслеживает контейнер `#chat` на появление новых сообщений     |
| **ResizeObserver API**      | Отслеживает изменения высоты контента внутри iframe            |
| **postMessage API**         | Кросс-фреймовая коммуникация между iframe и родительским окном |
| **iframe (srcdoc)**         | Изолированная среда выполнения пользовательского HTML          |
| **HTML / CSS**              | UI панели настроек и стилизация шаблона внутри iframe          |

### Схема архитектуры

```
┌──────────────────────────────────────────────────────┐
│                  Интерфейс SillyTavern               │
│                                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Контейнер #chat                    │  │
│  │                                                 │  │
│  │  ┌─────────────────────────────┐                │  │
│  │  │   Пузырь сообщения          │                │  │
│  │  │  ┌───────────────────────┐  │                │  │
│  │  │  │ <pre><code> блок      │◄─┼── Обнаружен    │  │
│  │  │  │ (скрыт после рендера) │  │   MutationObs. │  │
│  │  │  └───────────────────────┘  │                │  │
│  │  │  ┌───────────────────────┐  │                │  │
│  │  │  │ 👁 Показать код       │  │  Кнопка-тоггл  │  │
│  │  │  └───────────────────────┘  │                │  │
│  │  │  ┌───────────────────────┐  │                │  │
│  │  │  │  <iframe srcdoc="…">  │  │  Отрендеренный │  │
│  │  │  │  ┌─────────────────┐  │  │  виджет        │  │
│  │  │  │  │  Живой HTML/JS  │  │  │                │  │
│  │  │  │  │  (изолирован)   │  │  │                │  │
│  │  │  │  └─────────────────┘  │  │                │  │
│  │  │  └───────────────────────┘  │                │  │
│  │  └─────────────────────────────┘                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                      │
│  MutationObserver ──► scanAndExecuteScripts()        │
│       │                     │                        │
│       ▼                     ▼                        │
│  Следит за #chat     createInteractiveFrame()        │
│  (новые DOM-узлы)    ──► iframe + ResizeObserver     │
└──────────────────────────────────────────────────────┘
```

### Структура модулей (`index.js`)

Исходный код организован в **5 логических секций**:

| #   | Секция                 | Строки  | Описание                                                                                                                                                             |
| --- | ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Логика настроек**    | 15–31   | Загрузка/сохранение состояния чекбокса через API `extension_settings` ST                                                                                             |
| 2   | **Фабрика Iframe**     | 33–133  | `createInteractiveFrame(content)` — создаёт изолированный iframe с авто-ресайзом, тёмными скроллбарами, адаптивными медиа и ограничением высоты (`max-height: 80vh`) |
| 3   | **Логика выполнения**  | 136–200 | `scanAndExecuteScripts()` — сканирует все `<pre><code>` блоки в `#chat`, находит триггерные слова, создаёт iframe, вставляет кнопки-переключатели                    |
| 4   | **Логика наблюдателя** | 204–228 | `toggleObserver(isEnabled)` — запускает/останавливает `MutationObserver` на `#chat` для реакции на новые сообщения                                                   |
| 5   | **Инициализация**      | 230–247 | Точка входа jQuery — загружает `settings.html`, привязывает события, запускает наблюдатель после задержки в 1 секунду                                                |

---

## 📥 Установка

### Способ 1: Git Clone (рекомендуемый)

1. Перейдите в директорию расширений SillyTavern:

   ```bash
   cd SillyTavern/public/scripts/extensions/third-party/
   ```

2. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/itsfantomas/chat-js-runner.git
   ```

3. Перезапустите SillyTavern (или перезагрузите страницу).

4. Включите расширение: **Extensions** → **Chat JS Runner** → ☑️ _Enable JavaScript Execution_.

### Способ 2: Ручная загрузка

1. Скачайте [последний релиз](https://github.com/itsfantomas/chat-js-runner/archive/refs/heads/main.zip).
2. Распакуйте архив в `SillyTavern/public/scripts/extensions/third-party/chat-js-runner/`.
3. Перезапустите SillyTavern и включите расширение.

---

## 🚀 Использование

Расширение работает **автоматически**. После включения любой блок кода в чате, содержащий одно из ключевых слов-триггеров, будет отрендерен.

### Ключевые слова-триггеры

Расширение обнаруживает блоки кода, содержащие **любой** из этих маркеров:

| Триггер           | Когда использовать                                                      |
| ----------------- | ----------------------------------------------------------------------- |
| `<!DOCTYPE html>` | Стандартные HTML-страницы                                               |
| `<style>`         | Контент со стилями CSS                                                  |
| `RUN-ME`          | Явный маркер рендеринга (используйте в комментариях: `<!-- RUN-ME -->`) |

### Базовый пример

Напишите это в чате (или попросите ИИ сгенерировать):

````
```html
<!DOCTYPE html>
<html>
<body style="background: linear-gradient(135deg, #667eea, #764ba2);
             display: flex; align-items: center; justify-content: center;
             height: 100vh; margin: 0;">
  <button onclick="this.textContent = '✨ Работает!'"
          style="padding: 20px 40px; font-size: 18px; border: none;
                 border-radius: 12px; cursor: pointer;
                 background: white; color: #764ba2;">
    Нажми меня
  </button>
</body>
</html>
```
````

**Результат:** Вместо сырого кода вы увидите живую кнопку с градиентным фоном прямо в пузыре чата.

---

## 🎯 Написание промптов для тогл-пресетов — советы и лучшие практики

Если вы хотите, чтобы ИИ стабильно генерировал рендерящиеся виджеты, добавьте инструкции в ваш **тогл-пресет** (системный промпт, jailbreak или заметку автора). Ниже — профессиональные рекомендации:

### 1. Базовый промпт для интеграции

Добавьте в ваш **системный промпт** или **тогл-пресет**:

```
Когда я прошу визуальный элемент, виджет, интерфейс или любое визуальное
представление — генерируй ПОЛНЫЙ HTML-код внутри блока кода markdown. Требования:
- Всегда начинай с <!DOCTYPE html>
- Включай ВСЕ стили инлайн или в теге <style> (без внешних CSS-файлов)
- Включай ВСЕ скрипты инлайн (без внешних JS-файлов)
- Страница должна быть полностью самодостаточной и функциональной
- Используй тёмные цвета фона (чат имеет тёмную тему)
- Делай текст белым или светлым для читаемости
```

### 2. Продвинутый промпт для интерактивных виджетов

```
При генерации визуальных интерфейсов:
1. Оборачивай всё в <!DOCTYPE html> с полной структурой <html><head><body>
2. Весь CSS должен быть в теге <style> внутри <head> — без внешних ссылок
3. Весь JavaScript должен быть в тегах <script> — без внешних библиотек (кроме CDN)
4. Используй адаптивный дизайн: max-width: 100%, единицы относительно viewport
5. Предполагай тёмный фон (#1a1a2e или подобный) — используй светлые цвета текста
6. Добавляй плавные анимации через CSS transitions/keyframes для полировки
7. Делай интерактивные элементы с hover-эффектами
8. Держи код до 500 строк для оптимальной производительности рендеринга
```

### 3. Советы по триггерам

| Сценарий                | Рекомендация для промпта                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| **Карточки / дашборды** | _«Создай HTML-дашборд со статистикой в виде стилизованной сетки карточек»_  |
| **Мини-игры**           | _«Построй маленькую браузерную игру в одном HTML-файле с инлайн JS»_        |
| **Листы персонажей**    | _«Отрендери лист персонажа как стилизованную HTML-страницу с тёмной темой»_ |
| **Таймеры / часы**      | _«Создай анимированные цифровые часы на HTML и CSS»_                        |
| **Интерактивные карты** | _«Сгенерируй интерактивную SVG-карту внутри HTML-документа»_                |

### 4. Частые ошибки

> [!WARNING]
>
> - ❌ **Внешние зависимости** — `<link href="bootstrap.css">` НЕ загрузится внутри iframe. Используйте инлайн-стили.
> - ❌ **Отсутствие `<!DOCTYPE html>`** — Без ключевого слова-триггера блок кода не будет отрендерен.
> - ❌ **Слишком короткий код** — Блоки менее 50 символов пропускаются (защита при стриминге).
> - ❌ **Вызовы `localStorage` / `fetch`** — Изолированный iframe имеет ограниченный доступ к API браузера.
> - ✅ **CDN-ссылки работают** — `<script src="https://cdn.example.com/lib.js">` загружается нормально через `srcdoc`.

### 5. Рекомендуемые пресеты промптов

<details>
<summary>📋 Универсальный пресет для виджетов (нажмите, чтобы развернуть)</summary>

```
[Системная заметка: Интерактивный рендеринг]
Когда пользователь просит любой визуал, интерфейс, дашборд, карточку, игру или
анимированный элемент, ты ОБЯЗАН сгенерировать его как полный, самодостаточный
HTML-документ.

Обязательная структура:
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>/* все стили здесь */</style>
</head>
<body>
    <!-- контент здесь -->
    <script>/* все скрипты здесь */</script>
</body>
</html>

Правила дизайна:
- Тёмная тема: фон #0d1117, текст #e6edf3
- Акцентные цвета: неоновые тона (#58a6ff, #f78166, #7ee787)
- Скруглённые углы (border-radius: 12px)
- Тонкие тени (box-shadow) для глубины
- Плавные CSS-переходы на интерактивных элементах
- Адаптивность: %, vw/vh, clamp() — без фиксированных пиксельных ширин
- Все ассеты инлайн (SVG, base64 или нарисованные через CSS)
```

</details>

---

## 📁 Структура проекта

```
chat-js-runner/
├── index.js          # Основная логика расширения (настройки, фабрика iframe, наблюдатель)
├── manifest.json     # Манифест расширения SillyTavern (метаданные, точки входа)
├── settings.html     # HTML панели настроек (чекбокс вкл/выкл)
├── style.css         # Зарезервировано для будущих стилей
└── LICENSE           # Лицензия GPL-3.0
```

---

## ⚠️ Безопасность

| Аспект                        | Детали                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Песочница**                 | Код выполняется в `<iframe>` с `srcdoc`, обеспечивая изоляцию DOM от SillyTavern                       |
| **Нет атрибута `sandbox`**    | Iframe НЕ использует HTML-атрибут `sandbox`, поэтому скрипты имеют полный доступ внутри фрейма         |
| **Только клиентская сторона** | Всё выполнение происходит в браузере — серверный код не исполняется                                    |
| **Риски**                     | Вредоносный промпт может сгенерировать JS, обращающийся к `window.parent` или делающий сетевые запросы |
| **Защита**                    | Включайте расширение только с проверенными моделями/промптами. Выключайте, когда не нужно              |

> [!CAUTION]
> Это расширение выполняет произвольный HTML и JavaScript из сообщений, сгенерированных ИИ. Хотя изоляция через iframe обеспечивает базовый уровень безопасности, это **не** полноценная песочница. Используйте с осторожностью и включайте только когда вам конкретно нужен рендеринг виджетов.

---

## 🤝 Вклад в проект

Приветствуются любые вклады! Открывайте issues или pull requests на [GitHub](https://github.com/itsfantomas/chat-js-runner).

---

## 📄 Лицензия

Проект распространяется по лицензии **GNU General Public License v3.0** — подробности в файле [LICENSE](LICENSE).
