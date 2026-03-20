const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const tailwindcss = require('@tailwindcss/vite')

module.exports = defineConfig({
    server: {
        host: '0.0.0.0',
        allowedHosts: true,
    },
    plugins: [
        react.default ? react.default() : react(),
        tailwindcss.default ? tailwindcss.default() : tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'react-vendor';
                    }
                },
            },
        },
    },
})
