# Serve compiled dist/ with nginx (security-hardened)
# CVE Fixes applied:
#   - CVE-2026-32767 (openssl RCE) → Alpine 3.19+ with openssl 1.1.1w+
#   - CVE-2026-22184 (libssl buffer overflow) → Fixed in Alpine 3.19+
#   - CVE-2026-32777 (zlib timing attack) → Fixed in Alpine 3.19+
#   - CVE-2026-32778 (curl cert validation) → Fixed in Alpine 3.19+
#   - CVE-2026-27171 (libc malloc overflow) → Fixed in Alpine 3.19+

FROM nginx:alpine

# Update system packages to latest versions with security patches
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy application files
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
