# Prompt Log — Scout IA

Me apoyé en Claude durante el desarrollo para resolver dudas técnicas, entender APIs que no conocía y evitar perder tiempo en código mecánico. Dejo los prompts mas relevantes que utilice

---

## 1. Estructura base desde Figma

> "Tengo un diseño en Figma con header oscuro, formulario de 3 campos en fila y debajo un grid de paneles con gráficos y datos. Genera la estructura base en JSX con Tailwind."

Me generó un grid de 12 columnas uniforme que no tenía nada que ver con lo que tenía diseñado. En mi Figma los paneles tienen jerarquías distintas, los KPIs van en 4 columnas iguales pero los paneles de análisis tienen tamaños diferentes. Lo cambié a "grid-cols-4" para los KPIs y "grid-cols-3" para los paneles de análisis.

No usé el código directamente pero me sirvió igual. Partir de algo existente aunque esté mal es más rápido que empezar desde cero.

---

## 2. El score de oportunidad — cuando decidí no usar la IA

> "Tengo datos de tendencias y sentimiento de YouTube. Calcula un score del 0 al 100 que indique qué tan buena oportunidad es este mercado."

No lo usé. El mismo input me daba 67 en una llamada y 81 en la siguiente sin ningún cambio. Además necesitaba mostrar el score antes de que Claude terminara de generar el scout, y si dependía de él para calcularlo eso no era posible.

Al final lo hice con código: tendencia, sentimiento, engagement y términos en alza con pesos fijos. 

---

## 3. Integración con Slack — resolver un patrón técnico que no conocía

> "Cómo gestiono el límite de 3 segundos de Slack para slash commands si la operación tarda 20?"

Aquí sí usé la respuesta casi directa. No conocía el patrón async de Slack y no tenía sentido reinventarlo. Me explicó que hay que devolver HTTP 200 inmediatamente, usar el "response_url" para enviar el resultado cuando esté listo y "waitUntil" de Vercel para mantener la función viva.

Lo que decidí yo fue qué mandar en ese mensaje diferido: no el scout completo sino un preview de las primeras líneas con un enlace directo al dashboard usando el ID que devuelve Supabase al insertar.

---

## 4. El prompt del scout — la parte que más iteré yo

> "Crea un scout de campaña profesional para [producto], audiencia [Y], objetivo [Z]. Datos: tendencia creciente, pico en marzo, media 142.000 vistas por video en YouTube, sentimiento positivo 68%..."

La primera versión ignoraba los datos y devolvía consejos genéricos. Dos cambios lo arreglaron.

Primero, secciones fijas con los headers exactos que quería. Sin eso la estructura cambiaba en cada llamada y renderizarla de forma consistente en el dashboard era imposible.

Segundo, añadir al final: *"Sé específico. Cita los datos. Sin consejos genéricos."* Pasé de leer "considera usar redes sociales" a "con una media de 142.000 vistas por video y tendencia creciente desde octubre, el canal prioritario es YouTube con contenido de producto en formato corto." Esa diferencia es lo que hace útil a Scout.

También descubrí que si los headers del prompt están en inglés Claude mezcla idiomas aunque el resto esté en español. Tuve que pasarlos todos a español y reforzarlo en dos sitios: system prompt y al final del user prompt. Con uno solo no era suficiente.

---

## 5. El informe semanal — decidir qué información es útil de verdad

> "Tengo un script en Python que lee los scouts de la semana desde Supabase y quiero que Claude genere un informe para el equipo. ¿Cómo estructuro el prompt para que sea consistente y accionable?"

Me propuso cuatro bloques: qué pasó esta semana, sectores destacados, oportunidades y recomendación para la próxima semana. Los adopté porque tienen sentido para el contexto de una agencia.

Aunque tuve que resolver dos bugs. El informe llegaba cortado a Slack porque "max_tokens=600" era muy bajo y además el texto se truncaba con "[:600]" antes de enviarlo,lo detecté revisando los mensajes en Slack. El segundo: cuando los productos eran términos en inglés Claude respondía todo en inglés. Lo resolví poniéndolo en dos sitios a la vez.

---

## 6. Pronóstico IA — forzar estructura cuando el texto libre falla

> "Analiza estos datos y responde ÚNICAMENTE con este JSON exacto: { direction, confidence, summary, optimal_window, opportunities: [{week, label}], risks, weekly_values: [8 números] }. Para weekly_values: parte del último valor y proyecta 8 semanas considerando la tendencia y el contexto."

La primera versión pedía un análisis en texto libre e intentaba parsearlo después. Fallaba porque Claude cambiaba el formato entre llamadas, a veces añadía markdown, a veces cambiaba los nombres de los campos.

Incluir el schema JSON exacto en el prompt y añadir en el system prompt "Responde SOLO con JSON válido, sin texto adicional ni bloques de código" lo resolvió. Con eso pude conectar el output directamente al gráfico como una línea de predicción con marcadores de oportunidades.
