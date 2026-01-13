import { v4 as uuidv4 } from 'uuid';
import { getData, setData, removeData } from './storage-helper';
const DEVICE_ID_KEY = "app_device_id";

export const throttle = (
  func: (...args: unknown[]) => void,
  limit: number,
): ((...args: unknown[]) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function (this: unknown, ...args: unknown[]) {
    if (lastRan === null) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (lastFunc !== null) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(
        () => {
          if (Date.now() - (lastRan as number) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - (lastRan as number)),
      );
    }
  };
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function getInitials(
  name: string | null | undefined,
  count?: number,
): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase());

  return count && count > 0
    ? initials.slice(0, count).join('')
    : initials.join('');
}

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  if (baseUrl && baseUrl !== '/') {
    return process.env.NEXT_PUBLIC_BASE_PATH + pathname;
  } else {
    return pathname;
  }
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600)
    return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 604800)
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  if (diff < 31536000)
    return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;

  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
}

export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export const getDeviceId = (): string => {
  let deviceId = getData(DEVICE_ID_KEY) as string | undefined;
 
  if (!deviceId) {
    deviceId = uuidv4();
    setData(DEVICE_ID_KEY, deviceId);
  }
 
  return deviceId;
};
 
export const resetDeviceId = (): void => {
  removeData(DEVICE_ID_KEY);
};

export function getDeviceName(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  // Use User-Agent Client Hints when available
  // @ts-ignore
  if ((navigator as any).userAgentData && (navigator as any).userAgentData.brands) {
    // @ts-ignore
    return (navigator as any).userAgentData.brands.map((b: any) => b.brand).join(' ');
  }
  return navigator.platform || navigator.userAgent || undefined;
}

export function getDeviceType(): 'mobile' | 'web' {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent || '';
  return /Mobi|Android|iPhone|iPad/.test(ua) ? 'mobile' : 'web';
}

export function getOSVersion(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent || '';
  const match = ua.match(/(Android)\s?([0-9\.]+)|iPhone OS\s?([0-9_]+)|CPU\s+OS\s?([0-9_]+)|Windows NT\s?([0-9\.]+)|Mac OS X\s?([0-9_\.]+)/i);
  if (!match) return undefined;
  const ver = match[2] || match[3] || match[4] || match[5] || match[6];
  return ver ? ver.replace(/_/g, '.') : undefined;
}

export function getPushToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    // Placeholder for push token extraction/registration
    return 'push-ex-token';
  } catch (e) {
    return undefined;
  }
}

export async function getLocation(): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;

  const tryGeolocation = () =>
    new Promise<string | undefined>((resolve) => {
      if (!navigator.geolocation) return resolve(undefined);
      const onSuccess = (pos: GeolocationPosition) => {
        const { latitude, longitude } = pos.coords;
        resolve(`${latitude},${longitude}`);
      };
      const onError = () => resolve(undefined);
      navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000 });
    });

  try {
    const geo = await tryGeolocation();
    if (geo) {
      const coordsMatch = geo.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
      if (coordsMatch) {
        const lat = coordsMatch[1];
        const lon = coordsMatch[2];
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
            {
              headers: {
                'User-Agent': 'LoopSphereAdmin/1.0 (contact@loopbots.com)',
              },
            },
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData.display_name) return nomData.display_name as string;
            const addr = nomData.address || {};
            const parts = [addr.city || addr.town || addr.village || addr.county, addr.state, addr.country].filter(Boolean);
            if (parts.length) return parts.join(', ');
          }
        } catch (e) {
          // ignore and fallback to raw coords
        }
        return `${lat},${lon}`;
      }
      return geo;
    }

    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) return undefined;
      const data = await res.json();
      const city = data.city;
      const country = data.country_name || data.country;
      if (city && country) return `${city}, ${country}`;
      if (data.latitude && data.longitude) {
        const lat = data.latitude;
        const lon = data.longitude;
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
            {
              headers: {
                'User-Agent': 'LoopSphereAdmin/1.0 (contact@loopbots.com)',
              },
            },
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData.display_name) return nomData.display_name as string;
            const addr = nomData.address || {};
            const parts = [addr.city || addr.town || addr.village || addr.county, addr.state, addr.country].filter(Boolean);
            if (parts.length) return parts.join(', ');
          }
        } catch (e) {
          // ignore
        }
        return `${lat},${lon}`;
      }
    } catch (e) {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
}
