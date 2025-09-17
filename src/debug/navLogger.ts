// debug/navLogger.ts
export function installNavLogger() {
  try {
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function (...args) {
      console.warn('[NAV] history.pushState', args, new Error().stack);
      return origPush.apply(this, args as any);
    };
    history.replaceState = function (...args) {
      console.warn('[NAV] history.replaceState', args, new Error().stack);
      return origReplace.apply(this, args as any);
    };

    const wrap = (obj: any, key: string) => {
      const orig = obj[key];
      obj[key] = function (...args: any[]) {
        console.warn(`[NAV] window.location.${key}`, args, new Error().stack);
        return orig.apply(this, args);
      };
    };
    wrap(window.location, 'assign');
    wrap(window.location, 'replace');

    // Track window.location.href changes (simplified approach)
    const origHref = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    if (origHref && origHref.set) {
      Object.defineProperty(window.location, 'href', {
        set(v) {
          console.warn('[NAV] window.location.href set ->', v, new Error().stack);
          // @ts-ignore
          return origHref.set!.call(this, v);
        },
        get() {
          // @ts-ignore
          return origHref.get!.call(this);
        }
      });
    }
  } catch (e) {
    console.warn('[NAV] logger install failed', e);
  }
}