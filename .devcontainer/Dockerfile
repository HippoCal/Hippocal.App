FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Node.js und npm installieren
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs
RUN npm install -g @anthropic-ai/claude-code

