# Scout — Analiza el mercado con IA
> Analiza el mercado en tiempo real y genera scouts de campaña con IA en menos de 30 segundos.

Scout resuelve un problema concreto del día a día en marketing: antes de crear cualquier campaña hay que buscar datos de tendencias, leer foros, analizar si el mercado está activo... un proceso que puede llevar horas. Scout lo hace automático: conecta Google Trends + Reddit + Claude AI y devuelve un scout estructurado con datos reales, un score de oportunidad y predicción de demanda.

---

## Qué hace

| Paso | Descripción |
|---|---|
| 1. Tendencias | Consulta Google Trends para el producto en España: dirección (creciente / estable / en declive), estacionalidad mensual, predicción a 30 días y términos de búsqueda en alza |
| 2. Reddit | Obtiene los posts más relevantes de la semana, analiza el sentimiento (positivo / neutral / negativo) y mide el engagement medio |
| 3. Score de Oportunidad | Algoritmo propio (0–100) que pondera tendencia, sentimiento, engagement y términos en alza |
| 4. Scout con Claude | `claude-sonnet-4` genera en streaming un scout en 8 secciones citando los datos reales |
| 5. Historial | Todos los scouts se guardan en Supabase, filtrables por fuente (web / Slack) |
| 6. Slack | Comando `/scout producto \| audiencia \| objetivo` devuelve el scout directamente en el canal |

---

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **IA**: Anthropic Claude (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- **Datos de mercado**: `google-trends-api` + Reddit API (`snoowrap`)
- **Base de datos**: Supabase
- **UI**: Tailwind CSS + Recharts
- **PDF**: jsPDF

---

## Instalación y ejecución local

### 1. Clona el repositorio e instala dependencias

```bash
git clone https://github.com/ElSenpaiSAMA/scout.git
cd scout
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Anthropic — https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Supabase — https://supabase.com (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Reddit API — https://www.reddit.com/prefs/apps (crear app tipo "script")
REDDIT_CLIENT_ID=tu_client_id
REDDIT_CLIENT_SECRET=tu_client_secret
REDDIT_USERNAME=tu_usuario_reddit
REDDIT_PASSWORD=tu_contraseña_reddit

# Slack (opcional)
SLACK_SIGNING_SECRET=tu_signing_secret
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

> **Nota:** Si no configuras las credenciales de Reddit, la app funciona igualmente con datos de muestra para esa sección.

---

## Configuración de Slack (opcional)

1. Crea una app en [api.slack.com/apps](https://api.slack.com/apps)
2. Añade un **Slash Command** `/scout` apuntando a `https://tu-dominio.com/api/slack`
3. Copia el **Signing Secret** en `SLACK_SIGNING_SECRET`
4. Uso desde Slack: `/scout zapatillas running | hombres 25-40 | Conversión`

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
