import '@testing-library/jest-dom';

// Silenciar warnings de React sobre "not wrapped in act(...)" para mantener el output limpio
const originalError = console.error;
console.error = (...args: unknown[]) => {
    const [first, ...rest] = args;
    if (typeof first === 'string' && first.includes('not wrapped in act')) {
        return;
    }
    // @ts-ignore
    originalError(first, ...rest);
};

// Polyfill sencillo de TextEncoder / TextDecoder para react-router-dom en Jest
if (!(globalThis as any).TextEncoder) {
    (globalThis as any).TextEncoder = class {
        encode(_str: string) {
            return new Uint8Array();
        }
    };
}

if (!(globalThis as any).TextDecoder) {
    (globalThis as any).TextDecoder = class {
        decode(_bytes: Uint8Array) {
            return '';
        }
    };
}

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock de IntersectionObserver
window.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
    unobserve() {}
} as any;