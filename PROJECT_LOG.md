# top3.news — Project Log & Budget

## Budget (Running)

> Last updated: 2026-06-28

### Monthly costs

| Service | Detail | Cost/month |
|---------|---------|-----------|
| **Claude API** | claude-haiku-4-5, ~$0.001/article, ~15 new/day | ~$0.45 |
| **Twitter/X API** | Pay-as-you-go, $0.20/tweet × 1/day | ~$6.00 |
| **Domain (top3.news)** | $12/year prorrateado | ~$1.00 |
| **GitHub** | Repo público → Actions ilimitadas, Pages gratis | $0.00 |
| **Facebook API** | Meta Graph API para publicaciones | $0.00 |
| **Google Analytics** | GA4 | $0.00 |
| **TOTAL** | | **~$7.45/mes** |

### Annual costs

| Service | Cost/year |
|---------|-----------|
| Claude API | ~$5.40 |
| Twitter/X API | ~$72.00 |
| Domain (top3.news) | $12.00 |
| GitHub (compartido entre proyectos) | — |
| **TOTAL** | **~$89.40/año** |

### Twitter/X credits

- Cargado: **$10.00** (2026-06-28)
- Spending cap: $10.00/mes
- Costo estimado: $6.00/mes → alcanza ~1.5 meses con el saldo inicial
- Recargar cuando baje a $2.00

### Potencial de ingresos

- **Google AdSense** (`ca-pub-9748169351348753`) — pendiente revisión de Google (1–14 días desde 2026-06-27)
- Al aprobarse: ingresos por display ads en artículos

---

## Changelog

### 2026-06-28

- **Twitter/X auto-posting** — `scripts/post-twitter.js` + `.github/workflows/post-twitter.yml`
  - 1 post/día a la 1pm ET (plan pay-as-you-go, $0.20/tweet con URL)
  - Rota verticals igual que Facebook, 280 chars, marca `twitterPosted: true`
  - Cuenta: [@Top_3_News](https://x.com/Top_3_News)
  - Primer tweet publicado exitosamente: Tweet ID `2071287688079286399`
- **Fix: push conflict en publish.yml** — agregado `git pull --rebase` antes del push
- **Node.js 20 → 24** — todos los workflows actualizados para evitar deprecation warning

### 2026-06-27

- **Pixel-art OG images** — imágenes 1200×630px por vertical en `public/og/`
- **Deploy on push** — `.github/workflows/deploy.yml` reconstruye el sitio en cada push a `main` (ignorando content/ y .md)
- **SEO / AEO completo**
  - `src/app/sitemap.ts` — genera `/sitemap.xml` con todos los artículos + páginas de vertical
  - `src/app/robots.ts` — genera `/robots.txt` apuntando al sitemap
  - JSON-LD `NewsArticle` schema en cada artículo con `speakable` (AEO para Perplexity, ChatGPT Search)
  - Metadata completa `openGraph` + `twitter` en todas las páginas
- **Google AdSense** — `ca-pub-9748169351348753`, script live en layout.tsx, pendiente revisión
- **Google Analytics GA4** — `G-LZBWXVWW9M`, activo vía gtag.js en layout.tsx
- **Favicon y brand assets** — `brand/top3news-profile.png` (1024×1024), `brand/top3news-cover.png` (1500×500), `src/app/icon.png` (512×512)
- **Facebook auto-posting** — `scripts/post-facebook.js` + `.github/workflows/post-facebook.yml`
  - 9 posts/día (7am–11pm ET), rota entre 5 verticals por hora UTC
  - Página: [facebook.com/top3.news](https://facebook.com/top3.news) (Page ID: 327925460405940)
  - Formato: emoji + vertical + título + whatHappening + whyMatters + link + hashtags
- **Legal pages** — `/privacy`, `/terms`, `/data-deletion` (requeridas por Meta para el app)
- **Claude Haiku enhancement** — `scripts/enhance-articles.js`
  - Modelo: `claude-haiku-4-5-20251001`, max_tokens: 350
  - Campos: `whatHappening`, `whoInvolved`, `whyMatters`, `enhanced: true`
  - Costo real: ~$0.001/artículo (74 artículos = $0.07)
- **Custom domain** — top3.news conectado, removido basePath `/top3news`
- **Food vertical** — feeds RSS de Miami (Eater, Digest Miami, Miami Food Pug, Miami Curated, Miami Take). Yelp descartado (API de pago).
- **8-bit rank badges** — badges naranja pixel-art 1/2/3 en artículos

### 2026-06-26

- **Lanzamiento de top3.news** — Next.js 14 App Router + TailwindCSS + TypeScript
  - 5 verticals: Autos, Technology, Movies, Music, Food
  - Layout: 1 hero + 2 secundarios por vertical, fuente Press Start 2P, color `#ff5500`
  - Static export (`output: 'export'`), desplegado en GitHub Pages
  - GitHub Actions cron: 3 veces/día (4am, 11am, 7pm ET) para fetch + enhance + build + deploy
  - Contenido en `content/*.json` commiteado al repo (sin base de datos)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 App Router |
| Estilos | TailwindCSS |
| Lenguaje | TypeScript |
| Hosting | GitHub Pages (rama `gh-pages`) |
| Dominio | top3.news (custom domain) |
| CI/CD | GitHub Actions |
| AI | Claude Haiku (Anthropic API) |
| Social | Facebook Graph API + Twitter/X API v2 |
| Analytics | Google Analytics GA4 |
| Monetización | Google AdSense (pendiente) |

## Roadmap (pendiente)

- [ ] Instagram auto-posting (usa mismos tokens de Facebook, sin costo adicional)
- [ ] Aprobar AdSense y comenzar a generar ingresos
- [ ] Aumentar Twitter a más posts/día si el proyecto genera fondos suficientes
- [ ] Submit sitemap a Google Search Console
