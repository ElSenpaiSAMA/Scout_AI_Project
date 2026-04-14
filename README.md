# Scout IA — Analiza el mercado con IA
> Analiza el mercado en tiempo real y genera scouts de campaña con IA en menos de 30 segundos.

Scout resuelve un problema concreto del día a día en marketing: antes de crear cualquier campaña hay que buscar datos de tendencias, ver qué se publica en YouTube, rastrear noticias... un proceso que puede llevar horas. Scout lo hace automático: conecta Google Trends + YouTube + Tavily + Claude AI y devuelve un scout estructurado con datos reales, un score de oportunidad y predicción de demanda.

---

## Qué hace

| Paso | Descripción |
|---|---|
| 1. Tendencias | Consulta Google Trends para el producto en España: dirección (creciente / estable / en declive), estacionalidad mensual, predicción a 30 días y términos de búsqueda en alza |
| 2. YouTube | Obtiene los videos más relevantes de la semana, analiza el sentimiento (positivo / neutral / negativo) y mide el engagement medio en vistas |
| 3. Inteligencia Web | Busca con Tavily los artículos, noticias y foros más recientes sobre el producto y genera un resumen de contexto |
| 4. Score de Oportunidad | Algoritmo propio (0–100) que pondera tendencia, sentimiento, engagement y términos en alza |
| 5. Scout con Claude | `claude-sonnet-4` genera en streaming un scout en 8 secciones citando los datos reales |
| 6. Historial | Todos los scouts se guardan en Supabase, filtrables por fuente (web / Slack). Los scouts de Slack incluyen enlace directo al dashboard |
| 7. Slack | Comando `/scout producto \| audiencia \| objetivo` devuelve un preview del scout con enlace directo para verlo completo |

---

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **IA**: Anthropic Claude (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- **Datos de mercado**: `google-trends-api` · YouTube Data API v3 · Tavily Search API
- **Base de datos**: Supabase
- **UI**: Tailwind CSS + Recharts
- **PDF**: jsPDF

---

## Instalación y ejecución local

### 1. Clona el repositorio e instala dependencias

```bash
git clone https://github.com/ElSenpaiSAMA/Scout_AI_Project.git
cd Scout_AI_Project
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Anthropic — https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Supabase — https://supabase.com (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# YouTube Data API v3 — https://console.cloud.google.com
# Activa "YouTube Data API v3" y crea una API Key
YOUTUBE_API_KEY=AIza...

# Tavily Search API — https://tavily.com (registro gratuito, 1000 búsquedas/mes)
TAVILY_API_KEY=tvly-...

# URL pública de la app (para los enlaces del informe de Slack)
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

# Slack webhook para el informe semanal (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 3. Crea la tabla en Supabase

En el **SQL Editor** de tu proyecto Supabase, ejecuta:

```sql
create table scouts (
  id uuid default gen_random_uuid() primary key,
  product text not null,
  audience text not null,
  objective text not null,
  trends_data jsonb,
  reddit_data jsonb,
  scout_text text,
  source text default 'web',
  created_at timestamp with time zone default now()
);
```

### 4. Inicia el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Configuración de Slack (opcional)

1. Crea una app en [api.slack.com/apps](https://api.slack.com/apps)
2. Añade un **Slash Command** `/scout` apuntando a `https://tu-dominio.com/api/slack`
3. Añade un **Incoming Webhook** y copia la URL en `SLACK_WEBHOOK_URL`
4. Uso desde Slack: `/scout zapatillas running | hombres 25-40 | Conversión`
5. La respuesta incluye un preview del scout y un enlace directo al dashboard

---

## Informe semanal automático

El workflow `.github/workflows/weekly-report.yml` se ejecuta cada lunes a las 6am UTC y:
1. Hace un deploy a Vercel
2. Genera un informe semanal con Claude analizando todos los scouts de la semana
3. Lo envía al canal de Slack configurado

Requiere estos secrets en GitHub Actions: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `SLACK_WEBHOOK_URL`, `VERCEL_DEPLOY_HOOK`.

---

## Lo que mejoraría con más tiempo

- **Análisis de competidores** — comparar el interés del producto vs. competidores en Google Trends
- **Canales recomendados automáticamente** — que la IA justifique qué plataformas priorizar según los datos
- **PDF con gráficos** — el export actual es solo texto; incrustar los charts de Recharts en el PDF
- **Alertas de mercado** — notificación vía Slack cuando el score cambia más de 20 puntos en una semana
- **Score explicado** — que Claude justifique el número con un párrafo, no solo con un color

---

## Autor

**Matias Speroni** — Backend & Fullstack Developer  
[github.com/ElSenpaiSAMA](https://github.com/ElSenpaiSAMA) · [linkedin.com/in/matias-speroni](https://linkedin.com/in/matias-speroni)
