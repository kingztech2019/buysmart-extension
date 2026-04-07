# 🛍️ BuySmart — AI-Powered Shopping Assistant

> An open-source Chrome Extension that automatically detects products on e-commerce sites and delivers AI-powered price comparisons and buying recommendations — powered by [SearXNG](https://searxng.org/), [Tavily](https://tavily.com/), [Deepcrawl](https://deepcrawl.dev/), and [OpenRouter](https://openrouter.ai/).

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## ✨ Features

- 🔍 **Auto-detection** — Instantly scrapes product name, price, and image from supported sites
- 🤖 **AI Analysis** — Sends product data to an LLM (via OpenRouter) for structured reviews
- 🌐 **Price Comparison** — Uses SearXNG to search the web for competing prices and reviews
- 📝 **Manual Search** — Works on any website via a manual product name input
- 🐳 **One-Command Setup** — Full Docker Compose stack for zero-hassle deployment
- 🔓 **100% Open Source** — Self-host everything, no proprietary APIs required (except your OpenRouter key)

---

## 📹 Demo

Watch BuySmart in action:

<div align="center">
  <a href="https://www.youtube.com/watch?v=i3iLuH7colc" target="_blank">
    <img src="https://img.youtube.com/vi/i3iLuH7colc/0.jpg" alt="BuySmart Demo" width="600" />
  </a>

  **Click the image above to watch the demo →**
</div>

> **Getting started?** Follow our [Quick Start guide](#-quick-start) below!

---

## 🏪 Supported E-Commerce Sites

| Site | Auto-detected |
|------|:---:|
| Amazon | ✅ |
| eBay | ✅ |
| AliExpress | ✅ |
| Walmart | ✅ |
| Jumia | ✅ |
| Any other site | 🔍 Manual search |

---

## 🏗️ Architecture

```
Chrome Extension (React + TypeScript)
        │
        │  HTTP POST /api/v1/product-analysis
        ▼
  FastAPI Backend (Python)
        │
        ├──► SearXNG (self-hosted)
        │    → Searches for prices, reviews, alternatives
        │
        ├──► Tavily API (optional)
        │    → Targeted price search with rich snippets
        │
        ├──► Deepcrawl API (optional)
        │    → Bypasses anti-bot protections, extracts structured data
        │
        └──► OpenRouter API
             → LLM generates structured markdown analysis
```

### Price Extraction Strategy

BuySmart uses a three-layer approach to maximize price discovery:

1. **Tavily Search** (Layer 1) - Searches for product prices and returns snippets that mention prices
2. **Deepcrawl** (Layer 2) - Extracts clean markdown/HTML from pages that block direct access
3. **Direct HTTP** (Layer 3) - Falls back to simple HTTP requests for sites without protection

For best results, configure both `TAVILY_API_KEY` and `DEEPCRAWL_API_KEY` in your `.env` file.

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 18+](https://nodejs.org/) (to build the Chrome Extension)
- An [OpenRouter API key](https://openrouter.ai/keys) (free tier available)
- Google Chrome

---

### 1. Clone the Repository

```bash
git clone https://github.com/kingztech2019/buysmart-extension.git
cd buysmart-extension
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENROUTER_API_KEY=sk-or-your-key-here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct   # free tier

# Optional but highly recommended for better price extraction
TAVILY_API_KEY=tvly-your-key-here                # Get at https://app.tavily.com
DEEPCRAWL_API_KEY=dc-your-key-here               # Get at https://deepcrawl.dev

SEARXNG_SECRET_KEY=change-this-to-a-random-string
```

### 3. Start the Backend Stack

```bash
docker compose up -d
```

This starts:
- **SearXNG** at `http://localhost:8080`
- **BuySmart API** at `http://localhost:8000`
- **API Docs** at `http://localhost:8000/docs`

### 4. Build the Chrome Extension

```bash
npm install
npm run build
```

The built extension will be in the `dist/` folder.

### 5. Load into Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `dist/` folder

### 6. Use It!

Navigate to any product page on Amazon, eBay, AliExpress, Walmart, or Jumia and click the BuySmart extension icon. The sidebar will slide in automatically!

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ | — | Your OpenRouter API key |
| `OPENROUTER_MODEL` | ❌ | `mistralai/mistral-7b-instruct` | LLM model to use |
| `TAVILY_API_KEY` | ❌ | — | Tavily API for price search (highly recommended) |
| `DEEPCRAWL_API_KEY` | ❌ | — | Deepcrawl API for bypassing anti-bot (highly recommended) |
| `SEARXNG_SECRET_KEY` | ❌ | `buysmart-change-this-secret-key` | SearXNG secret (change in production!) |

### Choosing an OpenRouter Model

| Model | Cost | Quality |
|-------|------|---------|
| `mistralai/mistral-7b-instruct` | 🆓 Free | Good |
| `google/gemma-7b-it` | 🆓 Free | Good |
| `anthropic/claude-haiku` | 💰 Paid | Excellent |
| `google/gemini-flash-1.5` | 💰 Paid | Excellent |
| `anthropic/claude-3.5-sonnet` | 💰 Paid | Best |

---

## 🛠️ Development

### Running Backend Locally (without Docker)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # configure your env
uvicorn main:app --reload --port 8000
```

> You'll also need SearXNG running. Use Docker for just SearXNG:
> ```bash
> docker compose up searxng -d
> ```

### Running Frontend in Dev Mode

```bash
npm run dev
```

> Note: The Chrome Extension must be built (`npm run build`) and loaded as an unpacked extension to test Chrome-specific APIs.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/product-analysis` | Analyze a product |
| `GET` | `/api/v1/search?q=query` | Proxy SearXNG search |
| `GET` | `/docs` | Interactive API docs |

#### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/product-analysis \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Sony WH-1000XM5", "price": "$279"}'
```

---

## 📁 Project Structure

```
buysmart-extension/
├── backend/                 # Python FastAPI backend
│   ├── main.py              # App entry point
│   ├── config.py            # Settings (env vars)
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routes/
│   │   ├── analysis.py      # POST /api/v1/product-analysis
│   │   └── search.py        # GET /api/v1/search
│   ├── services/
│   │   ├── searxng.py       # SearXNG integration
│   │   └── openrouter.py    # OpenRouter LLM
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── searxng/
│   └── settings.yml         # SearXNG configuration
│
├── src/                     # Frontend (React + TypeScript)
│   ├── App.tsx
│   ├── index.css            # Design system
│   └── components/
│       ├── partials/        # Shared components
│       ├── supported/       # Product analysis UI
│       └── unsupported/     # Manual search UI
│
├── public/                  # Extension static files
│   ├── manifest.json
│   ├── background.js        # Service worker
│   └── content.js           # Page scraper
│
├── docker-compose.yml       # Full stack orchestration
├── .env.example             # Environment template
└── README.md
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Quick Links
- 📖 [Contributing Guide](CONTRIBUTING.md) - How to contribute
- 🏗️ [Architecture](ARCHITECTURE.md) - System design and technical details
- 🗺️ [Roadmap](ROADMAP.md) - Planned features and priorities
- 🚀 [Setup Guide](SETUP_GUIDE.md) - Detailed development setup
- 📝 [Changelog](CHANGELOG.md) - Version history

### Ways to Contribute

1. **🆕 Add scrapers for more e-commerce sites** (Target, Best Buy, Alibaba, etc.)
2. **🌍 Multi-language support** - Help translate the extension
3. **📊 Price history tracking** - Store and display price trends
4. **🔔 Price drop alerts** - Notify users of price changes
5. **🎨 Theme customization** - Dark mode, custom colors
6. **📱 Mobile support** - Firefox Mobile, Safari iOS
7. **🐛 Bug fixes** - Help squash bugs
8. **📚 Documentation** - Improve guides and tutorials

### Getting Started

1. Fork the repository
2. Follow the [Setup Guide](SETUP_GUIDE.md)
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Test thoroughly
6. Push and open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### What This Means
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Liability and warranty not provided

---

## 🙏 Acknowledgments

- [SearXNG](https://github.com/searxng/searxng) — The amazing open-source meta search engine
- [OpenRouter](https://openrouter.ai/) — Unified LLM API gateway
- [Tavily](https://tavily.com/) — AI-powered search API
- [Deepcrawl](https://deepcrawl.dev/) — Free and open-source web scraping
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python web framework
- The open-source community ❤️

---

## 📞 Contact & Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/kingztech2019/buysmart-extension/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](https://github.com/kingztech2019/buysmart-extension/issues/new?template=feature_request.md)
- 🏪 **New Site Support**: [Request site support](https://github.com/kingztech2019/buysmart-extension/issues/new?template=new_site_support.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/kingztech2019/buysmart-extension/discussions)
- 🔒 **Security**: See [SECURITY.md](SECURITY.md)

---

## ⭐ Star History

If you find BuySmart useful, please consider giving it a star! It helps others discover the project.

[![Star History Chart](https://api.star-history.com/svg?repos=kingztech2019/buysmart-extension&type=Date)](https://star-history.com/#kingztech2019/buysmart-extension&Date)

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/kingztech2019/buysmart-extension?style=social)
![GitHub forks](https://img.shields.io/github/forks/kingztech2019/buysmart-extension?style=social)
![GitHub issues](https://img.shields.io/github/issues/kingztech2019/buysmart-extension)
![GitHub pull requests](https://img.shields.io/github/issues-pr/kingztech2019/buysmart-extension)
![GitHub last commit](https://img.shields.io/github/last-commit/kingztech2019/buysmart-extension)

---

Made with ❤️ by the BuySmart community
