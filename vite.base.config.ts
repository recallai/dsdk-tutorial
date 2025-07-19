import type { Plugin } from 'vite';

const exposedModules = ['path', 'fs', 'os'];

export const pluginExposeRenderer = (name: string): Plugin => {
    return {
        name: 'expose-renderer',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                next();
            });
        },
        config() {
            return {
                build: {
                    rollupOptions: {
                        output: {
                            format: 'es',
                        },
                    },
                },
                optimizeDeps: {
                    exclude: exposedModules,
                },
            };
        },
        transform(code, id) {
            if (id.endsWith('.ts') || id.endsWith('.tsx')) {
                const newCode = code.replace(
                    /import\s+(\w+)\s+from\s+['"]electron['"]/g,
                    'const { $1 } = window.electron;',
                );
                return {
                    code: newCode,
                    map: null,
                };
            }
            return {
                code,
                map: null,
            };
        },
    };
}; 