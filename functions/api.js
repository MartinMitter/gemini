// functions/api.js

// ИЗМЕНЕНО: Импортируем новую, более простую библиотеку
const { GoogleGenAI } = require("@google/genai");

exports.handler = async function (event) {
  // Мы по-прежнему принимаем только POST-запросы
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Получаем API-ключ из переменных окружения Netlify (как и раньше)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    
    // ИЗМЕНЕНО: Инициализируем клиент API, передавая ключ напрямую
    const genAI = new GoogleGenAI(apiKey);

    // Получаем промпт от пользователя из тела запроса
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is required' }) };
    }

    // ИЗМЕНЕНО: Делаем один прямой вызов API. Гораздо проще!
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash", // Используем вашу модель
        contents: prompt,           // Просто передаем текст промпта
        generationConfig: {         // Добавляем вашу конфигурацию
            thinkingConfig: {
                thinkingBudget: 0
            }
        }
    });

    // ИЗМЕНЕНО: Получаем текст ответа напрямую
    const text = response.text;

    // Отправляем успешный ответ обратно на фронтенд
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Отправляем ошибку
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get response from Gemini." }),
    };
  }
};