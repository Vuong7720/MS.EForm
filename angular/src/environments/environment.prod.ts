import { Environment } from '@abp/ng.core';

// TODO-DEPLOY: thay bằng domain Cloudflare Pages thật sau khi deploy (vd: https://eform-xyz.pages.dev)
const baseUrl = 'https://TODO-DEPLOY-cloudflare-pages-domain';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'EForm',
    logoUrl: '',
  },
  oAuthConfig: {
    // TODO-DEPLOY: thay bằng domain AuthServer thật trên Render (vd: https://eform-authserver.onrender.com/)
    issuer: 'https://TODO-DEPLOY-render-authserver-domain/',
    redirectUri: baseUrl,
    clientId: 'EForm_App',
    responseType: 'code',
    scope: 'offline_access EForm',
    requireHttps: true
  },
  apis: {
    default: {
      // TODO-DEPLOY: thay bằng domain HttpApi.Host thật trên Render (vd: https://eform-httpapi-host.onrender.com)
      url: 'https://TODO-DEPLOY-render-httpapihost-domain',
      rootNamespace: 'MS.EForm',
    },
  },
} as Environment;

// Cloudflare Turnstile site key (public, không phải bí mật) cho widget chống spam ở trang nộp form.
// Đây là site key TEST do Cloudflare công bố (luôn pass) - PHẢI đổi sang site key thật (dash.cloudflare.com) khi deploy production.
// TODO-DEPLOY: thay bằng site key thật sau khi tạo Turnstile site ở Cloudflare dashboard.
export const captchaSiteKey = '1x00000000000000000000AA';
