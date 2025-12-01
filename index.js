// Import from SillyTavern core
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "chat-js-runner"; 
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

const defaultSettings = {
    enabled: true // Включим по умолчанию для удобства
};

let chatObserver = null;

// --- 1. SETTINGS LOGIC ---
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
    $("#chat_js_enable").prop("checked", extension_settings[extensionName].enabled);
    
    toggleObserver(extension_settings[extensionName].enabled);
}

function onCheckboxChange(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].enabled = value;
    saveSettingsDebounced();
    toggleObserver(value);
    console.log(`[${extensionName}] Setting saved:`, value);
}

// --- 2. IFRAME FACTORY ---
function createInteractiveFrame(content) {
    const frame = document.createElement('iframe');
    
    frame.style.width = "100%";
    frame.style.border = "none";
    frame.style.overflow = "hidden";
    frame.style.marginTop = "10px";
    frame.style.borderRadius = "8px";
    frame.style.backgroundColor = "transparent"; 
    
    // HTML Шаблон для изоляции
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    margin: 0; 
                    padding: 5px; 
                    font-family: sans-serif; 
                    color: white; 
                    overflow: hidden;
                    box-sizing: border-box;
                }
                /* Скрываем скроллбары */
                ::-webkit-scrollbar { display: none; }
            </style>
        </head>
        <body>
            ${content}
            
            <script>
                // Авто-ресайз: сообщает родительскому окну высоту контента
                function sendHeight() {
                    const height = document.body.scrollHeight;
                    window.parent.postMessage({
                        type: 'iframe-resize', 
                        height: height + 20
                    }, '*');
                }
                
                const observer = new MutationObserver(sendHeight);
                observer.observe(document.body, { attributes: true, childList: true, subtree: true });
                window.onload = sendHeight;
                window.onresize = sendHeight;
                setTimeout(sendHeight, 500);
            </script>
        </body>
        </html>
    `;

    frame.srcdoc = htmlTemplate;
    
    // Ловим сообщение о высоте и меняем размер фрейма
    frame.onload = function() {
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'iframe-resize') {
                // Простейшая проверка, чтобы не менять чужие фреймы
                // В идеале тут нужен ID, но для ST сойдет
                if (frame && frame.style) {
                     frame.style.height = e.data.height + 'px';
                }
            }
        });
    };

    return frame;
}

// --- 3. EXECUTION LOGIC ---
function scanAndExecuteScripts() {
    // Если расширение выключено в настройках - выходим
    if (!extension_settings[extensionName]?.enabled) return;

    const codeBlocks = $("#chat .mes_text pre code");
    
    codeBlocks.each(function() {
        const codeBlock = $(this);
        
        // Если уже обработали этот блок - пропускаем
        if (codeBlock.hasClass("js-executed")) return;

        let rawCode = codeBlock.text();
        if (!rawCode) return;

        // --- ВОТ ТУТ БЫЛА ОШИБКА В ПРОШЛЫЙ РАЗ ---
        // Мы объявляем переменную ПЕРЕД проверкой
        const isWidget = rawCode.includes("RUN-ME") || 
                         rawCode.includes("<!DOCTYPE html>") || 
                         rawCode.includes("<style>");

        if (isWidget) {
            try {
                // Проверка: Не рендерим, пока код слишком короткий (защита при стриминге)
                if (rawCode.length < 50) return;

                console.log(`[${extensionName}] 🚀 Creating Interface...`);
                
                const preTag = codeBlock.parent(); // Это тег <pre>
                
                // Кнопка "Показать код"
                const toggleBtn = $(`<div class="js-code-toggle">👁️ Show Source Code</div>`);
                toggleBtn.css({
                    "font-size": "10px",
                    "opacity": "0.4",
                    "cursor": "pointer",
                    "margin-bottom": "2px",
                    "text-align": "right",
                    "user-select": "none",
                    "color": "var(--SmartThemeBodyColor, #ccc)"
                });

                // Создаем Iframe
                const iframe = createInteractiveFrame(rawCode);
                
                // Вставляем в чат
                preTag.after(iframe);
                preTag.before(toggleBtn);
                
                // Скрываем оригинальный код
                preTag.hide();
                
                // Логика клика по кнопке "Показать код"
                toggleBtn.on("click", () => {
                    preTag.slideToggle(100);
                });

                // Помечаем как обработанное, чтобы не дублировать
                codeBlock.addClass("js-executed");

            } catch (err) {
                console.error(`[${extensionName}] Error:`, err);
            }
        }
    });
}

// --- 4. OBSERVER LOGIC ---
function toggleObserver(isEnabled) {
    if (chatObserver) {
        chatObserver.disconnect();
        chatObserver = null;
    }

    if (isEnabled) {
        const chatContainer = document.querySelector('#chat');
        if (!chatContainer) return;

        console.log(`[${extensionName}] 👁️ Observer started`);
        
        chatObserver = new MutationObserver((mutations) => {
            scanAndExecuteScripts();
        });

        chatObserver.observe(chatContainer, {
            childList: true,
            subtree: true
        });
        
        setTimeout(scanAndExecuteScripts, 500);
    }
}

// --- 5. INITIALIZATION ---
jQuery(async () => {
    console.log(`[${extensionName}] Loading v3.1 (Fix Edition)...`);
    try {
        const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
        $("#extensions_settings2").append(settingsHtml);

        $("#chat_js_enable").on("input", onCheckboxChange);
        
        // Ждем пока ST загрузит настройки
        setTimeout(loadSettings, 1000);
        
        console.log(`[${extensionName}] ✅ Loaded successfully`);
    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed to load:`, error);
    }
});
