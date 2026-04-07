# BuySmart Development Setup Guide

Complete guide for setting up BuySmart for local development.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [API Keys](#api-keys)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

---

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Check version
   node --version  # Should be v18.0.0 or higher
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Docker & Docker Compose**
   ```bash
   # Check versions
   docker --version  # Should be 20.10+ or higher
   docker compose version  # Should be 2.0+ or higher
   
   # Install Docker Desktop (includes Compose)
   # macOS: https://docs.docker.com/desktop/install/mac-install/
   # Windows: https://docs.docker.com/desktop/install/windows-install/
   # Linux: https://docs.docker.com/desktop/install/linux-install/
   ```

3. **Python 3.11+** (for local backend development)
   ```bash
   # Check version
   python3 --version  # Should be 3.11 or higher
   
   # Install via pyenv (recommended)
   curl https://pyenv.run | bash
   pyenv install 3.11
   pyenv global 3.11
   ```

4. **Git**
   ```bash
   git --version  # Any recent version
   ```

5. **Google Chrome** (for testing the extension)

### Optional Tools

- **VS Code** (recommended editor)
  - Extensions: ESLint, Prettier, Python, Docker
- **Postman** or **Insomnia** (for API testing)
- **Chrome DevTools** (built-in)

---

## Quick Start

For experienced developers who want to get started quickly:

```bash
# 1. Clone and install
git clone https://github.com/kingztech2019/buysmart-extension.git
cd buysmart-extension
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 3. Start services
docker compose up -d

# 4. Build extension
npm run build

# 5. Load in Chrome
# Go to chrome://extensions
# Enable "Developer mode"
# Click "Load unpacked"
# Select the dist/ folder
```

---

## Detailed Setup

### Step 1: Clone the Repository

```bash
# Clone your fork
git clone https://github.com/kingztech2019/buysmart-extension.git
cd buysmart-extension

# Add upstream remote
git remote add upstream https://github.com/kingztech2019/buysmart-extension.git

# Verify remotes
git remote -v
```

### Step 2: Install Frontend Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Install Backend Dependencies

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list

# Return to root
cd ..
```

### Step 4: Configure Environment Variables

```bash
# Copy example files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files
nano .env  # or use your preferred editor
```

**Required variables**:
```env
OPENROUTER_API_KEY=sk-or-your-key-here
```

**Optional but recommended**:
```env
TAVILY_API_KEY=tvly-your-key-here
DEEPCRAWL_API_KEY=dc_your-key-here
```

### Step 5: Start Backend Services

```bash
# Start Docker services
docker compose up -d

# Verify services are running
docker compose ps

# Check logs
docker compose logs -f

# You should see:
# - buysmart-backend (port 8000)
# - buysmart-searxng (port 9090)
```

### Step 6: Build the Extension

```bash
# Production build
npm run build

# Development build (with source maps)
npm run dev

# The extension will be in the dist/ folder
```

### Step 7: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to your project folder
5. Select the `dist/` folder
6. The extension should now appear in your extensions list

### Step 8: Test the Extension

1. Visit a supported site (e.g., amazon.com/product/...)
2. Click the BuySmart extension icon
3. The sidebar should open with product info
4. Click "Analyze" to test the full flow

---

## API Keys

### OpenRouter (Required)

1. Go to https://openrouter.ai/keys
2. Sign up or log in
3. Click "Create Key"
4. Copy the key (starts with `sk-or-`)
5. Add to `.env`: `OPENROUTER_API_KEY=sk-or-...`

**Free models**:
- `mistralai/mistral-7b-instruct`
- `google/gemma-7b-it`
- `qwen/qwen3.6-plus-preview:free`

### Tavily (Optional but Recommended)

1. Go to https://app.tavily.com
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env`: `TAVILY_API_KEY=tvly-...`

**Free tier**: 1,000 credits/month

### Deepcrawl (Optional but Recommended)

1. Go to https://deepcrawl.dev
2. Follow the quick start guide
3. Generate API key
4. Add to `.env`: `DEEPCRAWL_API_KEY=dc_...`

**Free tier**: Unlimited (open-source)

---

## Troubleshooting

### Docker Issues

**Problem**: `docker compose` command not found
```bash
# Solution: Use docker-compose (with hyphen)
docker-compose up -d

# Or update Docker Desktop to latest version
```

**Problem**: Port already in use
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or change port in docker-compose.yml
```

**Problem**: Services won't start
```bash
# Check logs
docker compose logs backend
docker compose logs searxng

# Restart services
docker compose restart

# Rebuild if needed
docker compose up -d --build
```

### Extension Issues

**Problem**: Extension won't load
- Check that you selected the `dist/` folder, not the root
- Make sure you ran `npm run build` first
- Check Chrome console for errors

**Problem**: Sidebar won't open
- Check that you're on a supported site
- Open Chrome DevTools → Console for errors
- Verify backend is running: http://localhost:8000/health

**Problem**: API requests fail
- Check backend logs: `docker compose logs backend`
- Verify API keys in `.env`
- Test API directly: `curl http://localhost:8000/health`

### Backend Issues

**Problem**: Import errors
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

**Problem**: OpenRouter API errors
- Verify API key is correct
- Check you have credits/quota
- Try a different model

**Problem**: SearXNG not responding
```bash
# Restart SearXNG
docker compose restart searxng

# Check if it's accessible
curl http://localhost:9090/healthz
```

### Build Issues

**Problem**: npm install fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Problem**: Build fails
```bash
# Check Node.js version
node --version  # Should be 18+

# Try with verbose logging
npm run build --verbose
```

---

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull upstream main

# 2. Start services (if not running)
docker compose up -d

# 3. Start development build
npm run dev

# 4. Make changes to code

# 5. Reload extension in Chrome
# Go to chrome://extensions
# Click reload icon on BuySmart extension

# 6. Test changes
```

### Making Changes

**Frontend changes** (src/):
```bash
# Edit React components
# Changes auto-rebuild with npm run dev
# Reload extension in Chrome to see changes
```

**Backend changes** (backend/):
```bash
# Edit Python files
# Restart backend to see changes
docker compose restart backend

# Or use auto-reload (development only)
cd backend
uvicorn main:app --reload --port 8000
```

**Extension manifest** (public/manifest.json):
```bash
# Edit manifest
# Rebuild extension
npm run build
# Reload extension in Chrome
```

### Testing

```bash
# Frontend linting
npm run lint

# Backend linting
cd backend
flake8 .

# Manual testing
# 1. Visit test sites
# 2. Click extension
# 3. Verify functionality
```

### Committing Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/my-feature

# Create pull request on GitHub
```

### Debugging

**Frontend debugging**:
1. Open Chrome DevTools (F12)
2. Go to Sources tab
3. Find your extension files
4. Set breakpoints
5. Reload extension

**Backend debugging**:
```bash
# View logs
docker compose logs -f backend

# Add print statements
logger.info(f"Debug: {variable}")

# Use Python debugger
import pdb; pdb.set_trace()
```

**Network debugging**:
1. Open Chrome DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Click extension icon
4. Watch API requests
5. Check request/response data

---

## Next Steps

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [ROADMAP.md](ROADMAP.md) for planned features
- Join discussions on GitHub

## Need Help?

- 📖 Check the [README](README.md)
- 🐛 Open an [issue](https://github.com/kingztech2019/buysmart-extension/issues)
- 💬 Start a [discussion](https://github.com/kingztech2019/buysmart-extension/discussions)
- 📧 Email: [your-email@example.com]

Happy coding! 🚀
