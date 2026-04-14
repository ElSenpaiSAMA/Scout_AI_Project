import os
import anthropic
import requests
from supabase import create_client
from datetime import datetime, timedelta

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
slack_webhook = os.environ.get("SLACK_WEBHOOK_URL", "")

week_ago = (datetime.now() - timedelta(days=7)).isoformat()
result = supabase.table("scouts").select("*").gte("created_at", week_ago).execute()
scouts = result.data or []

if not scouts:
    print("No scouts this week")
    exit(0)

products = [s["product"] for s in scouts]
objectives = list(set(s["objective"] for s in scouts))
web_count = sum(1 for s in scouts if s.get("source") == "web")
slack_count = sum(1 for s in scouts if s.get("source") == "slack")

print(f"Analysing {len(scouts)} scouts...")

summary = ""
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=600,
    system="Eres un analista de marketing. Responde SIEMPRE en español. Nunca uses inglés.",
    messages=[{
        "role": "user",
        "content": f"""Informe semanal de scouts de campaña:

Productos analizados: {', '.join(products)}
Objetivos: {', '.join(objectives)}
Total: {len(scouts)} scouts ({web_count} web, {slack_count} desde Slack)

Genera un informe semanal conciso. IMPORTANTE: escribe TODO el texto en español, sin excepción, aunque los nombres de productos estén en inglés:
## 📊 Esta Semana
## 🔥 Sectores Destacados
## 💡 Oportunidades Detectadas
## 🚀 Recomendación para la Próxima Semana

RECUERDA: respuesta completa en español."""
    }]
) as stream:
    for text in stream.text_stream:
        summary += text
        print(text, end="", flush=True)

if slack_webhook:
    requests.post(slack_webhook, json={
        "attachments": [{
            "color": "#38bdf8",
            "title": f"📊 Informe Semanal — {datetime.now().strftime('%d/%m/%Y')}",
            "text": f"*{len(scouts)} scouts esta semana* · {web_count} web · {slack_count} Slack\n\n{summary[:600]}",
            "footer": "Scout IA · Todos los lunes a las 6am"
        }]
    })
    print("\nSlack notified")
