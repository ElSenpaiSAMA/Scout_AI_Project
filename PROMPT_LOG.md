# Prompt Log — Scout IA

Claude fue una herramienta de apoyo durante el desarrollo. Lo usé para resolver dudas puntuales, entender APIs que no conocía y ahorrar tiempo en las partes más mecánicas. Las decisiones de arquitectura, diseño y producto son mías.

Estas son las interacciones que más influyeron en el resultado.

---

## Estructura inicial de la página

Tenía el diseño en Figma y no quería empezar el JSX desde cero. Es la parte más mecánica y no aportaba nada hacerla a mano.

> Tengo un diseño en Figma con header oscuro, formulario de 3 campos en fila y debajo un grid de paneles con gráficos y datos. Genera la estructura base en JSX con Tailwind en base a la imagen.

Lo que me dio no me servía directamente ya que usaba un grid de 12 columnas uniforme y en mi diseño los paneles tenían tamaños distintos según el contenido. Lo rechace y rehíce con "grid-cols-4" para los KPIs y "grid-cols-3" para los paneles de análisis.

Pero me sirvió igual. Partir de algo y existente aunque esté mal es más rápido que empezar con el archivo vacío. Me ahorró el rato más aburrido y pude meterle tiempo a lo que realmente importaba.

---

## El Score de Oportunidad — por qué no lo delegué a Claude

Intenté que Claude calculara el score:

> Tengo datos de tendencias y sentimiento de Reddit. Calcula un score del 0 al 100 que indique qué tan buena oportunidad es este mercado.

Dos problemas. Primero, no era reproducible ya que el mismo input me daba 67 en una llamada y 81 en la siguiente sin ningún cambio. Segundo, necesitaba mostrar el score antes de que Claude terminara de escribir el scout, y si dependía de él para calcularlo eso no era posible.

Al final lo hice con código: tendencia, sentimiento, engagement en Reddit y términos en alza, cada uno con un peso fijo. Es instantáneo, siempre da el mismo resultado para los mismos datos y aparece en pantalla antes de que empiece el streaming. Claude escribe el análisis, el valor lo calcula el código.

---

## Integración con Slack — el límite de 3 segundos

No había trabajado antes con slash commands y no sabía cómo resolver que generar un scout tarda unos 20 segundos cuando Slack espera respuesta en menos de 3.

> Cómo gestiono el límite de 3 segundos de Slack para slash commands si la operación tarda 20?

Me explicó que hay que devolver un HTTP 200 inmediatamente y usar el "response_url" para mandar el resultado cuando esté listo. En Vercel hay un "waitUntil" que mantiene la función viva después de responder. Lo apliqué tal cual.

Lo único que decidí yo fue mandar solo un preview de las primeras líneas. El mensaje incluye un enlace directo al scout completo en el dashboard (`/history?id=uuid`), que se construye a partir del ID que devuelve Supabase al insertar el registro.

---

## Fuente de datos de mercado — de Reddit a Tavily

La implementación inicial usaba Reddit (`snoowrap`) para obtener posts y sentimiento social. El problema fue que Reddit bloquea peticiones desde IPs de servidores cloud (Vercel) sin autenticación OAuth, y su proceso de registro de app es engorroso. Cuando fallaba, devolvía datos de muestra inventados sin avisar, lo que comprometía la calidad del scout sin que el usuario lo supiera.

Lo reemplacé por Tavily Search API: registro en un paso, un solo API key, y devuelve resultados de foros, reviews y noticias de toda la web. Para una herramienta de marketing es incluso mejor porque no limita los resultados a Reddit.

---

## El prompt del scout — lo que más tiempo me llevó

Es el núcleo del proyecto así que era donde más tenía que afinar.

Al principio le mandaba los datos de tendencias y búsqueda web con una instrucción simple. Los ignoraba. Devolvía consejos genéricos de marketing que no citaban ningún dato real.

Dos cosas lo arreglaron. Ponerle secciones fijas con los headers exactos que quería, sin eso la estructura cambiaba en cada llamada y no podía renderizarla bien en el dashboard. Y añadir al final: "Sé específico. Cita los datos. Sin consejos genéricos." Ese último cambio fue el más importante. Pasé de leer "considera usar redes sociales para llegar a tu audiencia" a "con una media de 1.200 votos por post en r/entrepreneur y tendencia creciente desde octubre...". Eso sí es me convencia mas.

Otra cosa que no esperaba: si escribes las secciones del prompt en inglés Claude mezcla idiomas aunque el resto esté en español. Tuve que pasarlas todas a español y añadir "todo en español" al final, además de dejarlo claro en el system prompt. Con una sola instrucción no era suficiente.

---

## El reporte semanal — estructura y problema de idioma

Tenía claro que quería un informe semanal automático para el equipo cada lunes, pero no cómo estructurar el prompt para que el output fuera útil y no un resumen genérico de lo que ya sabían.

> Tengo un script en Python que lee los briefs de la semana desde Supabase y quiero que Claude genere un informe para el equipo. Cómo estructuro el prompt para que sea consistente y accionable?

Me propuso cuatro bloques: qué pasó esta semana, qué sectores destacaron, qué oportunidades hay y qué hacer la próxima semana. Lo adopté porque tiene sentido para el contexto de una agencia.

El mismo problema de idioma apareció aquí pero mucho peor que antes ya que cuando los productos eran términos en inglés como "running shoes" Claude respondía todo en inglés. Lo resolví metiéndolo en dos sitios: en el system prompt y al final del user prompt con un "RECUERDA: respuesta completa en español." Con uno solo no alcanzaba.
