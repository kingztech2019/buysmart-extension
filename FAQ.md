# Frequently Asked Questions (FAQ)

## General Questions

### What is BuySmart?
BuySmart is an open-source Chrome Extension that helps you make smarter shopping decisions by automatically comparing prices across multiple retailers and providing AI-powered product analysis.

### Is BuySmart free?
Yes! BuySmart is 100% free and open-source under the MIT License. However, you'll need API keys for some services:
- **OpenRouter** (required): Free tier available
- **Tavily** (optional): 1,000 free credits/month
- **Deepcrawl** (optional): 100% free and open-source

### How does BuySmart make money?
It doesn't! This is a community-driven open-source project. There are no ads, no affiliate links, and no data collection.

### Is my data safe?
Yes. BuySmart:
- Doesn't store your browsing history
- Doesn't collect personal information
- Doesn't track your purchases
- Runs all analysis server-side (your API keys stay private)
- Is fully open-source (you can audit the code)

---

## Installation & Setup

### Which browsers are supported?
Currently:
- ✅ Google Chrome
- ✅ Microsoft Edge (Chromium-based)
- ⏳ Firefox (planned)
- ⏳ Safari (planned)

### How do I install BuySmart?
See the [Quick Start](README.md#-quick-start) section in the README.

### Do I need to install Docker?
Yes, Docker is required to run the backend services (SearXNG and FastAPI). See the [Setup Guide](SETUP_GUIDE.md) for installation instructions.

### Can I use BuySmart without Docker?
Not easily. The backend requires SearXNG (which runs in Docker) and the FastAPI server. You could run these manually, but Docker is the recommended approach.

### Where do I get API keys?
- **OpenRouter**: https://openrouter.ai/keys
- **Tavily**: https://app.tavily.com
- **Deepcrawl**: https://deepcrawl.dev

See the [API Keys](SETUP_GUIDE.md#api-keys) section for detailed instructions.

---

## Usage

### Which e-commerce sites are supported?
Currently supported:
- Amazon (all regions)
- eBay
- AliExpress
- Walmart
- Jumia

You can also use manual search mode on any site.

### How do I add support for a new site?
See [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on adding new site scrapers. You can also [request support](https://github.com/kingztech2019/buysmart-extension/issues/new?template=new_site_support.md) for a specific site.

### Why isn't the extension detecting my product?
Possible reasons:
1. The site isn't supported yet (use manual search mode)
2. The page structure changed (open an issue)
3. The product data isn't in the expected format
4. JavaScript hasn't finished loading (refresh the page)

### Why are some prices missing?
Price extraction depends on:
1. Whether the site allows scraping
2. Whether prices are in the page HTML
3. API rate limits (Tavily, Deepcrawl)
4. Anti-bot protections

The system uses a three-layer approach to maximize success, but some sites are harder to scrape than others.

### Can I use BuySmart offline?
No. BuySmart requires internet access to:
- Search for prices via SearXNG
- Scrape product pages
- Call the OpenRouter LLM API

---

## Technical Questions

### What LLM models are supported?
Any model available on OpenRouter:
- **Free**: Mistral 7B, Gemma 7B, Qwen 3.6
- **Paid**: Claude, GPT-4, Gemini Pro

See [OpenRouter models](https://openrouter.ai/models) for the full list.

### How accurate is the price comparison?
Accuracy depends on:
- **Data freshness**: Prices are fetched in real-time
- **Site coverage**: More sites = better comparison
- **Scraping success**: ~50-70% of searches find prices

We're constantly improving price extraction accuracy.

### How does the AI analysis work?
1. BuySmart searches for the product across multiple sites
2. Extracts prices, reviews, and product details
3. Sends this data to an LLM (via OpenRouter)
4. The LLM analyzes the data and returns structured recommendations

### Can I self-host everything?
Yes! BuySmart is designed to be self-hosted:
- Backend: Docker Compose
- SearXNG: Included in Docker Compose
- Extension: Load unpacked in Chrome

The only external dependencies are the API services (OpenRouter, Tavily, Deepcrawl).

### What's the difference between Tavily and Deepcrawl?
- **Tavily**: Searches for product prices and returns snippets
- **Deepcrawl**: Extracts full page content (bypasses anti-bot)

Both are optional but recommended for better price coverage.

---

## Troubleshooting

### The extension won't load
1. Make sure you built it: `npm run build`
2. Load the `dist/` folder, not the root folder
3. Check Chrome DevTools console for errors
4. Try reloading the extension

### The sidebar won't open
1. Check that you're on a supported site
2. Make sure the backend is running: `docker compose ps`
3. Test the API: `curl http://localhost:8000/health`
4. Check browser console for errors

### API requests are failing
1. Verify your API keys in `.env`
2. Check backend logs: `docker compose logs backend`
3. Test OpenRouter key: https://openrouter.ai/keys
4. Check rate limits (Tavily: 1,000/month)

### Prices aren't being found
1. Check backend logs for scraping errors
2. Verify Tavily/Deepcrawl API keys
3. Try a different product (some sites block scraping)
4. Open an issue with the product URL

### Docker services won't start
1. Check if ports are in use: `lsof -i :8000`
2. Restart Docker Desktop
3. Rebuild containers: `docker compose up -d --build`
4. Check logs: `docker compose logs`

See [SETUP_GUIDE.md#troubleshooting](SETUP_GUIDE.md#troubleshooting) for more solutions.

---

## Contributing

### How can I contribute?
Many ways!
- Add support for new e-commerce sites
- Improve price extraction accuracy
- Fix bugs
- Write documentation
- Translate to other languages
- Share feedback and ideas

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### I found a bug. What should I do?
1. Check if it's already reported in [Issues](https://github.com/kingztech2019/buysmart-extension/issues)
2. If not, [open a new issue](https://github.com/kingztech2019/buysmart-extension/issues/new?template=bug_report.md)
3. Include as much detail as possible (steps to reproduce, screenshots, logs)

### I have a feature idea
Great! [Open a feature request](https://github.com/kingztech2019/buysmart-extension/issues/new?template=feature_request.md) and describe:
- What problem it solves
- How you envision it working
- Why it would be valuable

### Do I need to know Python/React to contribute?
Not necessarily! You can contribute by:
- Writing documentation
- Testing and reporting bugs
- Suggesting features
- Translating to other languages
- Sharing the project

But if you do know Python/React, we'd love your code contributions!

---

## Privacy & Security

### What data does BuySmart collect?
None. BuySmart:
- Doesn't track your browsing
- Doesn't store your searches
- Doesn't collect personal information
- Doesn't use analytics or telemetry

### Are my API keys safe?
Yes, if you follow best practices:
- Store keys in `.env` files (never commit them)
- Don't share your `.env` files
- Rotate keys regularly
- Use environment-specific keys (dev vs prod)

### Can I audit the code?
Absolutely! The entire codebase is open-source. Check:
- [GitHub Repository](https://github.com/kingztech2019/buysmart-extension)
- [Architecture Documentation](ARCHITECTURE.md)

### How do I report a security vulnerability?
See [SECURITY.md](SECURITY.md) for our security policy and how to report issues responsibly.

---

## Roadmap & Future

### What features are planned?
See [ROADMAP.md](ROADMAP.md) for the full roadmap. Highlights:
- Price history tracking
- Price drop alerts
- Firefox/Safari support
- Mobile support
- Multi-language support
- More e-commerce sites

### When will feature X be released?
We don't have fixed release dates. Features are prioritized based on:
- Community demand (upvotes on issues)
- Technical complexity
- Contributor availability

Want to speed things up? Contribute! 🚀

### Can I sponsor the project?
Currently, we don't have a sponsorship program. The best way to support BuySmart is to:
- ⭐ Star the repository
- 🐛 Report bugs
- 💻 Contribute code
- 📢 Share with others

---

## Comparison

### How is BuySmart different from Honey/Rakuten?
| Feature | BuySmart | Honey/Rakuten |
|---------|----------|---------------|
| Open Source | ✅ Yes | ❌ No |
| Privacy | ✅ No tracking | ❌ Tracks purchases |
| AI Analysis | ✅ Yes | ❌ No |
| Affiliate Links | ❌ No | ✅ Yes (revenue) |
| Price History | ⏳ Planned | ✅ Yes |
| Coupons | ⏳ Planned | ✅ Yes |

### How is BuySmart different from CamelCamelCamel?
| Feature | BuySmart | CamelCamelCamel |
|---------|----------|-----------------|
| Multi-Site | ✅ Yes | ❌ Amazon only |
| AI Analysis | ✅ Yes | ❌ No |
| Real-Time | ✅ Yes | ✅ Yes |
| Price History | ⏳ Planned | ✅ Yes |
| Open Source | ✅ Yes | ❌ No |

---

## Still Have Questions?

- 📖 Read the [README](README.md)
- 🏗️ Check [ARCHITECTURE.md](ARCHITECTURE.md)
- 💬 Start a [Discussion](https://github.com/kingztech2019/buysmart-extension/discussions)
- 🐛 Open an [Issue](https://github.com/kingztech2019/buysmart-extension/issues)
- 📧 Email: [your-email@example.com]

---

*Last updated: 2026-04-02*
