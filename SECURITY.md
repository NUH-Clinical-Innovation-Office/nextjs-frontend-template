# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our project seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Where to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisory**: Use the [GitHub Security Advisory](../../security/advisories/new) feature

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: We aim to acknowledge receipt of your vulnerability report within 48 hours
- **Status Updates**: We will send you regular updates about our progress every 5-7 days
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days of the initial report

### What to Expect

After you submit a report, we will:

1. Confirm receipt of your vulnerability report
2. Investigate and validate the vulnerability
3. Determine the severity and impact
4. Develop and test a fix
5. Release a security patch
6. Publicly disclose the vulnerability (with credit to you, if desired)

## Security Best Practices

### For Contributors

- Never commit sensitive data (credentials, API keys, secrets) to the repository
- Use environment variables for configuration
- Keep dependencies up to date
- Follow secure coding practices
- Review code for security issues before submitting PRs

### For Users

- Always use the latest stable version
- Keep your dependencies updated
- Use strong authentication mechanisms
- Follow the principle of least privilege
- Regularly review security logs

## Disclosure Policy

- We follow responsible disclosure practices
- Security advisories will be published after fixes are released
- We will credit researchers who report vulnerabilities (unless they prefer to remain anonymous)

## Security Updates

Security updates and announcements will be published:

- In the [GitHub Security Advisories](../../security/advisories) section
- In release notes for patched versions
- Via commit messages tagged with `[SECURITY]`

## Contact

For any security-related questions or concerns, please contact the security team at your designated security email address.

---

Thank you for helping keep our project and users safe!
