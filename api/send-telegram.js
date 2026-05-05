function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatWindows(windows = []) {
  if (!Array.isArray(windows) || !windows.length) return "Размеры не указаны";
  return windows.map((item) => {
    const width = Number(item.width || 0);
    const height = Number(item.height || 0);
    const qty = Number(item.qty || 0);
    const area = Number(item.area || 0);
    return `• Окно ${item.number || ""}: ${width} × ${height} см, ${qty} шт. — ${area.toFixed(2)} м²`;
  }).join("\n");
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST."
    });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "Telegram env vars are not configured",
      telegramBotTokenConfigured: Boolean(token),
      telegramChatIdConfigured: Boolean(chatId)
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const name = escapeHtml(body.name || "Не указано");
  const phone = escapeHtml(body.phone || "");
  const address = escapeHtml(body.address || "Не указано");
  const settlement = escapeHtml(body.settlement || "—");
  const objectType = escapeHtml(body.objectType || "Не указано");
  const comment = escapeHtml(body.comment || "—");
  const totalArea = Number(body.totalArea || 0).toFixed(2);
  const totalQty = Number(body.totalQty || 0);
  const page = escapeHtml(body.page || "");
  const createdAt = escapeHtml(body.createdAt || new Date().toISOString());
  const windowsText = escapeHtml(formatWindows(body.windows));
  const utmText = body.utm && Object.keys(body.utm).length
    ? escapeHtml(JSON.stringify(body.utm, null, 2))
    : "—";

  if (!phone) {
    return res.status(400).json({
      ok: false,
      error: "Phone is required"
    });
  }

  const message = [
    "<b>Новая заявка: мягкие окна</b>",
    "",
    `<b>Имя:</b> ${name}`,
    `<b>Телефон:</b> ${phone}`,
    `<b>Поселок/гео:</b> ${settlement}`,
    `<b>Адрес/район:</b> ${address}`,
    `<b>Объект:</b> ${objectType}`,
    "",
    "<b>Размеры:</b>",
    `<pre>${windowsText}</pre>`,
    `<b>Итого:</b> ${totalArea} м², ${totalQty} шт.`,
    "",
    `<b>Комментарий:</b> ${comment}`,
    "",
    `<b>Страница:</b> ${page}`,
    `<b>UTM:</b> <pre>${utmText}</pre>`,
    `<b>Дата:</b> ${createdAt}`
  ].join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramResult.ok) {
      return res.status(502).json({
        ok: false,
        error: "Telegram API error",
        telegramResult
      });
    }

    return res.status(200).json({
      ok: true,
      api: "send-telegram",
      mode: "sendMessage",
      runtime: "nodejs-default"
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown server error"
    });
  }
};
