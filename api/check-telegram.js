module.exports = async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    api: "check-telegram",
    telegramBotTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    telegramChatIdConfigured: Boolean(process.env.TELEGRAM_CHAT_ID),
    runtime: "nodejs-default"
  });
};