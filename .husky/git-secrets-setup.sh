#!/bin/sh
# Script to register default and custom patterns for git-secrets

# Register AWS patterns
git secrets --register-aws

# Add custom regex patterns for common secrets
git secrets --add 'stripe_(live|test)_[0-9a-zA-Z]{24}'
git secrets --add 'AIza[0-9A-Za-z\-_]{35}'
git secrets --add 'ssh-rsa AAAA[0-9A-Za-z+/]+'

echo "git-secrets patterns registered successfully."