# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of BuySmart seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please Do:
1. **Email us** at [your-security-email@example.com] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

2. **Allow time** for us to respond (we aim for 48 hours)

3. **Work with us** to understand and resolve the issue

## Security Best Practices for Users

### API Keys
- **Never commit API keys** to version control
- Store keys in `.env` files (already in `.gitignore`)
- Rotate keys regularly
- Use environment-specific keys (dev vs production)

### Self-Hosting
- Use HTTPS for all production deployments
- Keep Docker images updated
- Implement rate limiting on public endpoints
- Use strong secrets for SearXNG and other services
- Regularly update dependencies

### Extension Security
- Only install from official sources (Chrome Web Store)
- Review permissions requested by the extension
- Keep the extension updated
- Report suspicious behavior immediately

## Known Security Considerations

### API Key Exposure
- API keys are stored in environment variables
- Never expose `.env` files publicly
- Backend validates and sanitizes all inputs

### Web Scraping
- Respects robots.txt when possible
- Implements rate limiting to avoid overwhelming sites
- Uses legitimate user agents

### Data Privacy
- No user data is stored permanently
- Product searches are not logged with personal information
- All API calls are made server-side (not from user's browser)

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Users will be notified through:
- GitHub Security Advisories
- Release notes
- README updates

## Disclosure Policy

- Security issues are disclosed after a fix is available
- We credit researchers who report vulnerabilities (unless they prefer to remain anonymous)
- We maintain a security changelog

## Contact

For security concerns, please contact: [your-security-email@example.com]

For general questions, use GitHub Issues.

Thank you for helping keep BuySmart and its users safe!
