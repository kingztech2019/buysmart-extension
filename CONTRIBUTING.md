# Contributing to BuySmart

First off, thank you for considering contributing to BuySmart! It's people like you that make BuySmart such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, logs, etc.)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, browser version, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other tools** (if applicable)

### Adding Support for New E-Commerce Sites

One of the most valuable contributions! To add a new site:

1. Add detection logic in `public/content.js`
2. Create a scraper function for the site's product data
3. Test thoroughly on multiple product pages
4. Update the README with the new supported site
5. Submit a PR with examples

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the existing code style** (we use ESLint and Prettier)
3. **Write clear commit messages** following conventional commits:
   - `feat: add support for Target.com`
   - `fix: correct price extraction on Amazon`
   - `docs: update installation instructions`
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Submit the PR** with a clear description

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Python 3.11+

### Local Development

```bash
# Clone your fork
git clone https://github.com/kingztech2019/buysmart-extension.git
cd buysmart-extension

# Install dependencies
npm install
cd backend && pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start backend services
docker compose up -d

# Build extension
npm run build

# For development with hot reload
npm run dev
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest

# Linting
npm run lint
cd backend && flake8
```

## Project Structure

```
buysmart-extension/
├── backend/              # FastAPI backend
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic (scraping, LLM)
│   └── models/          # Data schemas
├── src/                 # React frontend
│   └── components/      # UI components
├── public/              # Extension files
│   ├── manifest.json    # Chrome extension config
│   ├── content.js       # Page scraper
│   └── background.js    # Service worker
└── searxng/             # SearXNG configuration
```

## Coding Guidelines

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions focused and small
- Use async/await for I/O operations

```python
async def scrape_product(url: str) -> Optional[dict]:
    """
    Scrape product data from a URL.
    
    Args:
        url: Product page URL
        
    Returns:
        Product data dict or None if scraping fails
    """
    # Implementation
```

### JavaScript/TypeScript (Frontend)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and reusable
- Use meaningful variable names

```typescript
interface ProductData {
  name: string;
  price: string;
  image?: string;
}

const ProductCard: React.FC<{ product: ProductData }> = ({ product }) => {
  // Implementation
};
```

### CSS

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use semantic color names

## Adding New Features

### Priority Areas

1. **New E-Commerce Sites** - Target, Best Buy, Alibaba, etc.
2. **Price History Tracking** - Store and display price trends
3. **Price Drop Alerts** - Notify users of price changes
4. **Multi-Language Support** - i18n for global users
5. **Better Price Extraction** - Improve accuracy and coverage
6. **Mobile Support** - Firefox Mobile, Safari iOS

### Feature Development Process

1. **Discuss first** - Open an issue to discuss the feature
2. **Get feedback** - Wait for maintainer input
3. **Implement** - Create a feature branch
4. **Test thoroughly** - Include edge cases
5. **Document** - Update README and add examples
6. **Submit PR** - With clear description and screenshots

## API Key Management

- **Never commit API keys** to the repository
- Use `.env` files (already in `.gitignore`)
- Document required API keys in README
- Provide `.env.example` templates

## Testing Guidelines

### What to Test

- Product detection on supported sites
- Price extraction accuracy
- API endpoint responses
- Error handling
- Edge cases (missing data, blocked requests)

### Writing Tests

```python
# Backend test example
def test_price_extraction():
    html = '<span class="price">$299.99</span>'
    price = extract_price(html)
    assert price == "$299.99"
```

```typescript
// Frontend test example
test('renders product name', () => {
  render(<ProductCard product={{ name: 'Test Product', price: '$99' }} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

## Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Create guides for new features
- Keep API documentation current

## Community

- Be respectful and inclusive
- Help others in issues and discussions
- Share your use cases and feedback
- Celebrate contributions from others

## Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Credited in the project

## Questions?

Feel free to:
- Open an issue for questions
- Join discussions
- Reach out to maintainers

Thank you for contributing to BuySmart! 🎉
