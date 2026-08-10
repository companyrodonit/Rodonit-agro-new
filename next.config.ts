import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  // drizzle-kit лишається зовнішнім пакетом: інакше Turbopack намагається
  // трансформувати require('drizzle-kit/api') всередині Payload і збірка падає.
  serverExternalPackages: ['drizzle-kit'],
  // На Desktop лежить сторонній package-lock.json — без явного root
  // Turbopack приймає його за корінь воркспейсу.
  turbopack: { root: import.meta.dirname },
};

export default withPayload(nextConfig);
