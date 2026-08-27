import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'EForm',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44320/',
    redirectUri: baseUrl,
    clientId: 'EForm_App',
    responseType: 'code',
    scope: 'offline_access EForm',
    requireHttps: true
  },
  apis: {
    default: {
      url: 'https://localhost:44383',
      rootNamespace: 'MS.EForm',
    },
  },
} as Environment;

// Cloudflare Turnstile site key (public, không phải bí mật) cho widget chống spam ở trang nộp form.
// Đây là site key TEST do Cloudflare công bố (luôn pass) - PHẢI đổi sang site key thật (dash.cloudflare.com) khi deploy production.
export const captchaSiteKey = '1x00000000000000000000AA';
