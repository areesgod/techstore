import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_receipt_email(to_email: str, to_name: str, order_id: int, items: list, total: float):
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    from_addr = os.getenv("SMTP_FROM", "noreply@techstore.com")

    if not smtp_host or not smtp_user:
        print(f"[EMAIL] Receipt for order #{order_id} would be sent to {to_email} (SMTP not configured)")
        return

    items_html = "".join(
        f"<tr><td style='padding:6px 12px'>{i['name']}</td>"
        f"<td style='padding:6px 12px;text-align:center'>{i['quantity']}</td>"
        f"<td style='padding:6px 12px;text-align:right'>${i['price']:.2f}</td></tr>"
        for i in items
    )

    html = f"""
    <div style='font-family:sans-serif;max-width:520px;margin:auto'>
      <div style='background:#1d4ed8;padding:24px;text-align:center'>
        <h1 style='color:white;margin:0;font-size:22px'>⚡ TechStore</h1>
      </div>
      <div style='padding:24px;background:#fff'>
        <h2 style='color:#1e3a8a'>Thank you, {to_name}!</h2>
        <p style='color:#555'>Your order <strong>#{order_id}</strong> has been confirmed.</p>
        <table style='width:100%;border-collapse:collapse;margin:16px 0'>
          <thead>
            <tr style='background:#f1f5f9'>
              <th style='padding:8px 12px;text-align:left'>Product</th>
              <th style='padding:8px 12px;text-align:center'>Qty</th>
              <th style='padding:8px 12px;text-align:right'>Price</th>
            </tr>
          </thead>
          <tbody>{items_html}</tbody>
          <tfoot>
            <tr>
              <td colspan='2' style='padding:8px 12px;font-weight:bold'>Total</td>
              <td style='padding:8px 12px;text-align:right;font-weight:bold;color:#1d4ed8'>${total:.2f}</td>
            </tr>
          </tfoot>
        </table>
        <p style='color:#555'>Visit <a href='http://localhost:5173/account' style='color:#2563eb'>My Account</a> to download your digital products.</p>
      </div>
      <div style='background:#f8fafc;padding:16px;text-align:center;color:#94a3b8;font-size:12px'>
        © TechStore — All rights reserved
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"TechStore Order #{order_id} — Payment Confirmed"
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_addr, to_email, msg.as_string())
        print(f"[EMAIL] Receipt sent to {to_email} for order #{order_id}")
    except Exception as e:
        print(f"[EMAIL] Failed to send receipt: {e}")
