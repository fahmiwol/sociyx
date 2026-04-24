/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook';

export interface Client {
  id: string;
  name: string;
  description: string;
  industry: 'fashion' | 'f&b' | 'tech' | 'beauty' | 'other';
  initials: string;
  color: string;
  logo?: string;
}

export interface Mission {
  id: string;
  clientId: string;
  title: string;
  platform: Platform[];
  scheduledTime: string;
  status: 'scheduled' | 'draft' | 'failed' | 'completed';
  type: 'image' | 'video' | 'carousel';
}

export interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  points: number[];
}

export interface BrandAsset {
  id: string;
  clientId: string;
  name: string;
  type: 'logo' | 'font' | 'color' | 'media';
  url: string;
}
