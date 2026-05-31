"""
Email utility — uses Resend HTTP API (works on Render free tier).

Set these environment variables:
  RESEND_API_KEY   — get one free at https://resend.com
  EMAIL_FROM       — your verified sender (e.g. onboarding@resend.dev for testing)
  FRONTEND_URL     — your live frontend URL

Setup (5 min):
  1. Sign up at resend.com (GitHub login)
  2. Go to API Keys → Create API Key → copy it
  3. Set RESEND_API_KEY on Render
  4. For testing use from: "onboarding@resend.dev"
  5. For production: add your domain in Resend → Domains → verify DNS
"""

import os
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def _send(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        print(f"[EMAIL] RESEND_API_KEY not set — would send '{subject}' to {to}")
        return False
    try:
        r = resend.Emails.send({
            "from": f"TechStore <{EMAIL_FROM}>",
            "to": [to],
            "subject": subject,
            "html": html,
        })
        print(f"[EMAIL] ✓ Sent '{subject}' → {to} (id: {r.get('id', '?')})")
        return True
    except Exception as e:
        print(f"[EMAIL] ✗ Failed: {e}")
        return False


# ── Base HTML wrapper ─────────────────────────────────────────────

def _wrap(body: str) -> str:
    return f"""
    <div style="font-family:Inter,sans-serif;max-width:540px;margin:auto;background:#f8fafc">
      <div style="background:#1d4ed8;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center">
        <span style="color:white;font-size:24px;font-weight:800">⚡ TechStore</span>
      </div>
      <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        {body}
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">
        © TechStore. Если вы не запрашивали это письмо — просто проигнорируйте его.
      </p>
    </div>
    """


# ── Password reset ────────────────────────────────────────────────

def send_password_reset_email(to_email: str, to_name: str, token: str) -> bool:
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    body = f"""
    <h2 style="color:#1e293b;margin-top:0">Сброс пароля</h2>
    <p style="color:#475569">Привет, <strong>{to_name}</strong>!</p>
    <p style="color:#475569">Мы получили запрос на сброс пароля для вашего аккаунта TechStore.
       Нажмите кнопку ниже, чтобы задать новый пароль.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="{reset_url}"
         style="background:#1d4ed8;color:white;text-decoration:none;padding:14px 32px;
                border-radius:8px;font-weight:700;font-size:15px;display:inline-block">
        Сбросить пароль
      </a>
    </div>
    <p style="color:#94a3b8;font-size:13px">
      Ссылка действительна в течение <strong>1 часа</strong>.<br>
      Если вы не запрашивали сброс пароля — ничего не делайте, ваш аккаунт в безопасности.
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:11px;word-break:break-all">
      Или вставьте эту ссылку в браузер:<br>{reset_url}
    </p>
    """
    return _send(to_email, "Сброс пароля — TechStore", _wrap(body))


# ── Order receipt ─────────────────────────────────────────────────

def send_receipt_email(to_email: str, to_name: str, order_id: int, items: list, total: float) -> bool:
    items_html = "".join(
        f"<tr><td style='padding:8px 12px;color:#374151'>{i['name']}</td>"
        f"<td style='padding:8px 12px;text-align:center;color:#374151'>{i['quantity']}</td>"
        f"<td style='padding:8px 12px;text-align:right;font-weight:600;color:#1d4ed8'>₸{int(i['price']):,}</td></tr>"
        for i in items
    )
    downloads_url = f"{FRONTEND_URL}/account"
    body = f"""
    <h2 style="color:#1e293b;margin-top:0">Спасибо за заказ! 🎉</h2>
    <p style="color:#475569">Привет, <strong>{to_name}</strong>!</p>
    <p style="color:#475569">Ваш заказ <strong>#{order_id}</strong> подтверждён и принят в обработку.</p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
      <thead>
        <tr style="background:#f1f5f9">
          <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px">ТОВАР</th>
          <th style="padding:10px 12px;text-align:center;color:#64748b;font-size:12px">КОЛ-ВО</th>
          <th style="padding:10px 12px;text-align:right;color:#64748b;font-size:12px">СУММА</th>
        </tr>
      </thead>
      <tbody>{items_html}</tbody>
      <tfoot>
        <tr style="background:#f8fafc">
          <td colspan="2" style="padding:12px;font-weight:700;color:#111827">Итого</td>
          <td style="padding:12px;text-align:right;font-weight:800;font-size:18px;color:#1d4ed8">₸{int(total):,}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align:center;margin:24px 0">
      <a href="{downloads_url}"
         style="background:#1d4ed8;color:white;text-decoration:none;padding:12px 28px;
                border-radius:8px;font-weight:600;display:inline-block">
        Мои загрузки
      </a>
    </div>
    <p style="color:#94a3b8;font-size:13px;text-align:center">
      Цифровые продукты доступны сразу в разделе «Мои загрузки».
    </p>
    """
    return _send(to_email, f"Заказ #{order_id} подтверждён — TechStore", _wrap(body))


# ── Welcome email ─────────────────────────────────────────────────

def send_welcome_email(to_email: str, to_name: str) -> bool:
    body = f"""
    <h2 style="color:#1e293b;margin-top:0">Добро пожаловать в TechStore! 🎉</h2>
    <p style="color:#475569">Привет, <strong>{to_name}</strong>!</p>
    <p style="color:#475569">Ваш аккаунт успешно создан. Теперь вам доступны:</p>
    <ul style="color:#475569;line-height:2">
      <li>30+ цифровых продуктов и гаджетов</li>
      <li>Программа лояльности с кэшбэком до 50%</li>
      <li>Мгновенная доставка цифровых товаров</li>
      <li>История заказов и загрузок</li>
    </ul>
    <div style="text-align:center;margin:28px 0">
      <a href="{FRONTEND_URL}/products"
         style="background:#1d4ed8;color:white;text-decoration:none;padding:12px 28px;
                border-radius:8px;font-weight:600;display:inline-block">
        Перейти в магазин
      </a>
    </div>
    """
    return _send(to_email, "Добро пожаловать в TechStore!", _wrap(body))
