# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Deepcrawl integration for enhanced price extraction
- Three-layer price extraction strategy (Tavily → Deepcrawl → Direct HTTP)
- Comprehensive logging for debugging price extraction
- Smart price scoring system that prefers actual product prices over fees
- Support for Nigerian Naira (₦) and other currencies
- Detailed response logging from Deepcrawl API

### Changed
- Improved price extraction algorithm with context-aware scoring
- Enhanced plausibility checks for price validation
- More lenient price range validation (30%-300% of base price)
- Better handling of regional pricing variations

### Fixed
- Price extraction now correctly identifies product prices vs shipping costs
- Improved handling of 403 Forbidden errors with Deepcrawl fallback
- Better URL normalization for matching Tavily and SearXNG results

## [1.0.0] - 2026-04-02

### Added
- Initial release
- Chrome Extension with React + TypeScript frontend
- FastAPI backend with Python
- SearXNG integration for price comparison
- OpenRouter LLM integration for product analysis
- Tavily API integration for price search
- Support for Amazon, eBay, AliExpress, Walmart, Jumia
- Auto-detection of product data on supported sites
- Manual search mode for unsupported sites
- Docker Compose setup for easy deployment
- Structured markdown analysis output
- Price comparison cards
- Accordion-style analysis sections

### Features
- 🔍 Auto-detect products on e-commerce sites
- 🤖 AI-powered product analysis
- 🌐 Multi-site price comparison
- 📝 Manual product search
- 🐳 One-command Docker setup
- 🔓 100% open source

---

## Version History

### Versioning Scheme
- **Major** (X.0.0): Breaking changes, major new features
- **Minor** (1.X.0): New features, backward compatible
- **Patch** (1.0.X): Bug fixes, minor improvements

### Upgrade Notes

#### From 0.x to 1.0
- First stable release
- Set up `.env` file with API keys
- Run `docker compose up -d` to start services
- Rebuild extension with `npm run build`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this changelog.

## Links
- [GitHub Repository](https://github.com/kingztech2019/buysmart-extension)
- [Issue Tracker](https://github.com/kingztech2019/buysmart-extension/issues)
- [Documentation](README.md)
