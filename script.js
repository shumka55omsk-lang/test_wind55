const CONFIG = {
  phoneDisplay: "48-98-78",
  phoneTel: "+73812489878",
  whatsappUrl: "https://wa.me/79039812452?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%80%D0%B0%D1%81%D1%81%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C%20%D0%BC%D1%8F%D0%B3%D0%BA%D0%B8%D0%B5%20%D0%BE%D0%BA%D0%BD%D0%B0%20%D0%B2%20%D0%9E%D0%BC%D1%81%D0%BA%D0%B5.",
  telegramUrl: "https://t.me/Anvar_company",
  maxUrl: "https://max.ru/u/f9LHodD0cOLj76aZjFESkEjxSbv_ofti1cN5XI0YOvDp1yXr_IPVvSgBW5s"
};

function setMessengerLinks(ids, url) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.href = url;
    el.target = "_blank";
    el.rel = "nofollow noopener";
  });
}

setMessengerLinks(["waLink", "waFooter", "waMobile"], CONFIG.whatsappUrl);
setMessengerLinks(["tgLink", "tgFooter"], CONFIG.telegramUrl);
setMessengerLinks(["maxLink", "maxFooter"], CONFIG.maxUrl);

const windowsList = document.getElementById("windowsList");
const addWindow = document.getElementById("addWindow");
const totalAreaEl = document.getElementById("totalArea");
const totalItemsEl = document.getElementById("totalItems");
const leadForm = document.getElementById("leadForm");
const formStatus = document.getElementById("formStatus");
const utmField = document.getElementById("utmField");

function getUtm() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid", "gclid"].forEach(key => {
    if (params.get(key)) result[key] = params.get(key);
  });
  return result;
}

if (utmField) {
  utmField.value = JSON.stringify(getUtm());
}

function setStatus(type, message) {
  if (!formStatus) return;
  formStatus.className = `form-status ${type}`;
  formStatus.textContent = message;
}

function createWindowRow(values = {}) {
  if (!windowsList) return;

  const row = document.createElement("div");
  row.className = "window-row";
  row.innerHTML = `
    <label>Ширина, см
      <input class="w-width" type="number" inputmode="decimal" min="1" step="1" value="${values.width || ""}" placeholder="200">
    </label>
    <label>Высота, см
      <input class="w-height" type="number" inputmode="decimal" min="1" step="1" value="${values.height || ""}" placeholder="180">
    </label>
    <label>Кол-во
      <input class="w-qty" type="number" inputmode="numeric" min="1" step="1" value="${values.qty || 1}">
    </label>
    <button type="button" class="remove-window" aria-label="Удалить окно">×</button>
  `;

  row.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", updateSummary);
  });

  row.querySelector(".remove-window").addEventListener("click", () => {
    if (windowsList.children.length > 1) {
      row.remove();
      updateSummary();
    }
  });

  windowsList.appendChild(row);
  updateSummary();
}

function getWindowsData() {
  if (!windowsList) return [];

  return [...windowsList.querySelectorAll(".window-row")].map((row, index) => {
    const width = Number(row.querySelector(".w-width").value || 0);
    const height = Number(row.querySelector(".w-height").value || 0);
    const qty = Number(row.querySelector(".w-qty").value || 0);
    const area = width > 0 && height > 0 && qty > 0 ? (width * height * qty / 10000) : 0;
    return {
      number: index + 1,
      width,
      height,
      qty,
      area: Number(area.toFixed(2))
    };
  });
}

function updateSummary() {
  if (!totalAreaEl || !totalItemsEl) return;

  const windows = getWindowsData();
  const totalArea = windows.reduce((sum, item) => sum + item.area, 0);
  const totalItems = windows.reduce((sum, item) => sum + (item.qty || 0), 0);
  totalAreaEl.textContent = `${totalArea.toFixed(2)} м²`;
  totalItemsEl.textContent = String(totalItems);
}

if (windowsList) {
  createWindowRow({ width: "", height: "", qty: 1 });
}

addWindow?.addEventListener("click", () => createWindowRow());

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", "");

  const submitBtn = leadForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Отправляем...";

  const formData = new FormData(leadForm);
  const windows = getWindowsData();
  const validWindows = windows.filter(w => w.width > 0 && w.height > 0 && w.qty > 0);
  const totalArea = validWindows.reduce((sum, item) => sum + item.area, 0);
  const totalQty = validWindows.reduce((sum, item) => sum + item.qty, 0);

  if (!validWindows.length) {
    setStatus("err", "Укажите хотя бы один размер окна.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить заявку";
    return;
  }

  const payload = {
    name: formData.get("name") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
    settlement: formData.get("settlement") || "",
    objectType: formData.get("objectType") || "",
    comment: formData.get("comment") || "",
    windows: validWindows,
    totalArea: Number(totalArea.toFixed(2)),
    totalQty,
    utm: getUtm(),
    page: window.location.href,
    createdAt: new Date().toLocaleString("ru-RU", { timeZone: "Asia/Omsk" })
  };

  try {
    const response = await fetch("/api/send-telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось отправить заявку");
    }

    setStatus("ok", "Заявка отправлена. Мы получили размеры и контакты.");
    leadForm.reset();
    if (windowsList) {
      windowsList.innerHTML = "";
      createWindowRow({ qty: 1 });
    }
  } catch (error) {
    setStatus("err", "Заявка не отправилась. Проверьте переменные Telegram в Vercel или позвоните 48-98-78.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить заявку";
  }
});
