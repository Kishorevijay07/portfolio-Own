"""Send the contact-form message as an email.

Preferred provider: Resend (HTTP API, one env var). Fallback: SMTP.
If neither is configured, raises EmailError so the endpoint returns a clear
"not configured" response (the frontend then falls back to the mailto link).
"""
import smtplib
from email.message import EmailMessage

import httpx
from starlette.concurrency import run_in_threadpool

from . import config


class EmailError(Exception):
    pass


def _format(name: str, email: str, message: str) -> tuple[str, str]:
    subject = f"Portfolio contact from {name}"
    body = f"Name: {name}\nEmail: {email}\n\n{message}"
    return subject, body


async def send_contact_email(name: str, email: str, message: str) -> None:
    subject, body = _format(name, email, message)

    if config.RESEND_API_KEY and config.CONTACT_TO_EMAIL:
        await _send_resend(subject, body, reply_to=email)
        return

    if config.SMTP_HOST and config.SMTP_USER and config.SMTP_PASS and config.CONTACT_TO_EMAIL:
        await run_in_threadpool(_send_smtp, subject, body, email)
        return

    raise EmailError("Contact email is not configured on the server.")


async def _send_resend(subject: str, body: str, reply_to: str) -> None:
    payload = {
        "from": config.CONTACT_FROM_EMAIL,
        "to": [config.CONTACT_TO_EMAIL],
        "subject": subject,
        "text": body,
        "reply_to": reply_to,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            json=payload,
            headers={"Authorization": f"Bearer {config.RESEND_API_KEY}"},
        )
        resp.raise_for_status()


def _send_smtp(subject: str, body: str, reply_to: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config.SMTP_USER
    msg["To"] = config.CONTACT_TO_EMAIL
    msg["Reply-To"] = reply_to
    msg.set_content(body)

    with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
        server.starttls()
        server.login(config.SMTP_USER, config.SMTP_PASS)
        server.send_message(msg)
