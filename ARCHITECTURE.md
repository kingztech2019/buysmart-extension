# BuySmart Architecture

This document provides a detailed overview of BuySmart's architecture, design decisions, and technical implementation.

## Table of Contents
- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Decisions](#design-decisions)
- [Security](#security)
- [Performance](#performance)
- [Deployment](#deployment)

---

## System Overview

BuySmart is a Chrome Extension that provides AI-powered shopping assistance through price comparison and product analysis. The system consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Content     │  │  Background  │  │   Sidebar    │      │
│  │  Script      │  │   Worker     │  │   (React)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    HTTP POST /api/v1/product-analysis
                             │
          ┌──────────────────▼──────────────────┐
          │      FastAPI Backend (Python)       │
          │  ┌────────────────────────────────┐ │
          │  │  Routes  │  Services  │ Models │ │
          │  └────────────────────────────────┘ │
          └──────────────┬──────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌────────┐      ┌──────────┐    ┌──────────┐
   │SearXNG │      │  Tavily  │    │Deepcrawl │
   │(Self-  │      │   API    │    │   API    │
   │hosted) │      │(External)│    │(External)│
   └────────┘      └──────────┘    └──────────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  OpenRouter  │
                  │  LLM API     │
                  └──────────────┘
```

---

## Component Architecture

### 1. Chrome Extension (Frontend)

#### Content Script (`public/content.js`)
- **Purpose**: Scrapes product data from e-commerce pages
- **Responsibilities**:
  - Detect current website
  - Extract product name, price, image
  - Inject sidebar into page
  - Communicate with background worker

```javascript
// Site detection pattern
const SUPPORTED_SITES = {
  amazon: {
    pattern: /amazon\.(com|co\.uk|de|fr|ca)/,
    selectors: {
      name: '#productTitle',
      price: '.a-price-whole',
      image: '#landingImage'
    }
  },
  // ... more sites
};
```

#### Background Worker (`public/background.js`)
- **Purpose**: Service worker for extension lifecycle
- **Responsibilities**:
  - Handle extension icon clicks
  - Manage extension state
  - Coordinate between content script and sidebar

#### Sidebar UI (`src/`)
- **Purpose**: React-based user interface
- **Technology**: React 18 + TypeScript + Tailwind CSS
- **Components**:
  - `SupportedComponents.tsx`: Auto-detected product view
  - `UnsupportedComponents.tsx`: Manual search view
  - `Analysis.tsx`: AI analysis display
  - `PriceComparisonCard.tsx`: Price comparison cards
  - `Accordion.tsx`: Collapsible sections

**State Management**:
```typescript
interface ProductState {
  productName: string;
  price: string;
  imageUrl?: string;
  analysis?: AnalysisResponse;
  loading: boolean;
  error?: string;
}
```

### 2. Backend API (FastAPI)

#### Routes (`backend/routes/`)

**`analysis.py`**: Main product analysis endpoint
```python
@router.post("/product-analysis")
async def product_analysis(request: ProductAnalysisRequest):
    # 1. Search for prices via SearXNG
    search_results = await search_product_prices(
        request.product_name, 
        base_price=request.price
    )
    
    # 2. Analyze with LLM
    result = await analyze_product(
        product_name=request.product_name,
        price=request.price,
        search_results=search_results
    )
    
    return result
```

**`search.py`**: SearXNG proxy endpoint
```python
@router.get("/search")
async def search(q: str):
    # Proxy to SearXNG
    return await searxng_search(q)
```

#### Services (`backend/services/`)

**`searxng.py`**: Search orchestration
- Queries SearXNG for product information
- Combines shopping and general search results
- Deduplicates by URL
- Enriches with scraped prices

**`scraper.py`**: Three-layer price extraction
```python
# Layer 1: Tavily Search
tavily_results = await search_prices_via_tavily(product_name, api_key)

# Layer 2: Deepcrawl scraping
deepcrawl_results = await scrape_via_deepcrawl(url, api_key)

# Layer 3: Direct HTTP fallback
direct_results = await scrape_direct(url)
```

**`openrouter.py`**: LLM integration
- Constructs prompts with search results
- Calls OpenRouter API
- Parses structured JSON response
- Validates against Pydantic schemas

#### Models (`backend/models/schemas.py`)

```python
class ProductAnalysisRequest(BaseModel):
    product_name: str
    price: Optional[str] = None
    site: Optional[str] = None

class ProductAnalysisResponse(BaseModel):
    verdict: str  # "good_deal" | "fair_price" | "overpriced"
    summary: str
    sections: List[AnalysisSection]
    price_comparison: List[PriceComparison]
```

### 3. External Services

#### SearXNG (Self-Hosted)
- **Purpose**: Meta search engine
- **Configuration**: `searxng/settings.yml`
- **Engines**: Google, Bing, DuckDuckGo, Shopping engines
- **Port**: 9090 (internal Docker network)

#### Tavily API
- **Purpose**: Targeted price search
- **Tier**: Free (1,000 credits/month)
- **Returns**: Rich snippets with prices
- **Fallback**: Deepcrawl if no results

#### Deepcrawl API
- **Purpose**: Structured content extraction
- **Features**: Bypasses anti-bot, returns markdown
- **Tier**: Free and open-source
- **Use Case**: Sites that block direct HTTP

#### OpenRouter API
- **Purpose**: LLM inference
- **Models**: Mistral, Gemma, Claude, GPT
- **Response**: Structured JSON analysis
- **Fallback**: None (required service)

---

## Data Flow

### Product Analysis Flow

```
1. User visits product page
   ↓
2. Content script detects site & extracts data
   ↓
3. User clicks extension icon
   ↓
4. Sidebar opens with product info
   ↓
5. User clicks "Analyze"
   ↓
6. POST /api/v1/product-analysis
   {
     "product_name": "Sony WH-1000XM5",
     "price": "$399"
   }
   ↓
7. Backend searches SearXNG
   ↓
8. Backend enriches with Tavily/Deepcrawl
   ↓
9. Backend sends to OpenRouter LLM
   ↓
10. LLM returns structured analysis
   ↓
11. Backend validates & returns JSON
   ↓
12. Sidebar displays analysis
```

### Price Extraction Flow

```
SearXNG Search
   ↓
Initial Results (often no prices)
   ↓
┌─────────────────────────────────┐
│  Layer 1: Tavily Search         │
│  - Searches for "product price" │
│  - Returns snippets with prices │
│  - Success rate: ~20-30%        │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  Layer 2: Deepcrawl Scraping    │
│  - Extracts markdown from pages │
│  - Bypasses anti-bot protection │
│  - Success rate: ~30-40%        │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  Layer 3: Direct HTTP           │
│  - Simple HTTP GET requests     │
│  - Parses ld+json & meta tags   │
│  - Success rate: ~10-20%        │
└─────────────┬───────────────────┘
              ↓
        Merged Results
     (50-70% have prices)
```

---

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **Vite**: Build tool
- **Chrome Extension APIs**: Browser integration

### Backend
- **FastAPI**: Web framework
- **Python 3.11+**: Language
- **Pydantic**: Data validation
- **httpx**: Async HTTP client
- **uvicorn**: ASGI server

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Orchestration
- **SearXNG**: Search engine
- **Cloudflare Workers**: (Deepcrawl backend)

### External APIs
- **OpenRouter**: LLM inference
- **Tavily**: Price search
- **Deepcrawl**: Web scraping

---

## Design Decisions

### Why Chrome Extension?
- **Pros**: Direct page access, no manual URL entry, seamless UX
- **Cons**: Limited to Chrome (for now)
- **Alternative**: Web app (planned for future)

### Why FastAPI?
- **Pros**: Fast, async, auto-docs, type hints
- **Cons**: Python ecosystem (vs Node.js)
- **Alternative**: Express.js (considered but rejected)

### Why SearXNG?
- **Pros**: Self-hosted, privacy-focused, multi-engine
- **Cons**: Requires Docker, maintenance overhead
- **Alternative**: Direct API calls (more expensive)

### Why Three-Layer Scraping?
- **Problem**: Single method has low success rate
- **Solution**: Fallback chain maximizes coverage
- **Trade-off**: More API calls, but better results

### Why OpenRouter?
- **Pros**: Model flexibility, unified API, cost-effective
- **Cons**: External dependency
- **Alternative**: Direct OpenAI/Anthropic (more expensive)

---

## Security

### API Key Management
- Stored in `.env` files (gitignored)
- Passed via environment variables
- Never exposed to frontend
- Rotated regularly (recommended)

### Input Validation
- Pydantic schemas validate all inputs
- SQL injection: N/A (no database)
- XSS: React auto-escapes
- CSRF: Not applicable (no sessions)

### Rate Limiting
- SearXNG: Built-in rate limiting
- OpenRouter: API key limits
- Tavily: 1,000 credits/month
- Deepcrawl: Fair use policy

### CORS
- Backend allows extension origin only
- No public API access (yet)

---

## Performance

### Optimization Strategies

**Frontend**:
- Code splitting (React.lazy)
- Image lazy loading
- Debounced search input
- Cached API responses

**Backend**:
- Async I/O (httpx, asyncio)
- Parallel scraping (asyncio.gather)
- Connection pooling
- Response streaming (planned)

**Caching**:
- SearXNG: Built-in caching
- Deepcrawl: Response caching
- Browser: Service worker cache (planned)

### Metrics

| Operation | Target | Actual |
|-----------|--------|--------|
| Page detection | <100ms | ~50ms |
| API request | <5s | ~3-4s |
| Price scraping | <10s | ~5-8s |
| LLM analysis | <3s | ~1-2s |

---

## Deployment

### Development
```bash
docker compose up -d
npm run dev
```

### Production
```bash
# Build extension
npm run build

# Deploy backend
docker compose -f docker-compose.prod.yml up -d

# Load extension in Chrome
chrome://extensions → Load unpacked → dist/
```

### Environment Variables
```env
# Required
OPENROUTER_API_KEY=sk-or-...

# Optional but recommended
TAVILY_API_KEY=tvly-...
DEEPCRAWL_API_KEY=dc_...

# Optional
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
SEARXNG_SECRET_KEY=random-string
```

### Scaling Considerations
- **Horizontal**: Multiple backend instances behind load balancer
- **Vertical**: Increase Docker resource limits
- **Caching**: Redis for API response caching
- **Database**: PostgreSQL for price history (planned)

---

## Future Architecture

### Planned Improvements
1. **Microservices**: Split scraping into separate service
2. **Message Queue**: RabbitMQ for async scraping
3. **Database**: PostgreSQL for price history
4. **Cache Layer**: Redis for hot data
5. **CDN**: Cloudflare for static assets
6. **Monitoring**: Prometheus + Grafana

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Questions?

Open an issue or discussion on GitHub!
