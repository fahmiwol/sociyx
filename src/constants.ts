/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Mission, Metric } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'TechBento',
    description: 'Gadget & Future Tech Reviewer',
    industry: 'tech',
    initials: 'TB',
    color: '#3b82f6',
  },
  {
    id: 'client-2',
    name: 'GlowUp Lab',
    description: 'Skincare & Beauty Clinic',
    industry: 'beauty',
    initials: 'GL',
    color: '#10b981',
  },
  {
    id: 'client-3',
    name: 'Kopi Rakyat',
    description: 'Coffee Roastery & Artisan Cafe',
    industry: 'f&b',
    initials: 'KR',
    color: '#f97316',
  },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm-1',
    clientId: 'client-1',
    title: 'Review terbaru gadget masa depan',
    platform: ['instagram', 'tiktok'],
    scheduledTime: '14:30 WIB',
    status: 'scheduled',
    type: 'video',
  },
  {
    id: 'm-2',
    clientId: 'client-2',
    title: '5 Cara menjaga hidrasi kulit',
    platform: ['instagram'],
    scheduledTime: '16:00 WIB',
    status: 'draft',
    type: 'image',
  },
  {
    id: 'm-3',
    clientId: 'client-3',
    title: 'Kenapa Arabica lebih populer dari',
    platform: ['tiktok'],
    scheduledTime: '09:00 WIB',
    status: 'failed',
    type: 'video',
  },
];

export const MOCK_METRICS: Metric[] = [
  {
    label: 'Total Jangkauan',
    value: '124.8K',
    change: 12,
    trend: 'up',
    points: [35, 35, 20, 10, 15],
  },
  {
    label: 'Engagement Rate',
    value: '4.82%',
    change: 0.4,
    trend: 'up',
    points: [25, 20, 30, 5, 10],
  },
  {
    label: 'Followers Baru',
    value: '1,240',
    change: 8.4,
    trend: 'up',
    points: [30, 10, 20, 5, 15],
  },
  {
    label: 'Klik Tautan',
    value: '850',
    change: -2,
    trend: 'down',
    points: [10, 15, 35, 30, 30],
  },
];
