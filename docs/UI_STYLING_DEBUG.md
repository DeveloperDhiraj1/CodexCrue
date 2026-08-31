# CodexCrue UI Styling Debug

## Root cause

The frontend listed Tailwind CSS, PostCSS, and Autoprefixer in `package.json`, but the project had no `tailwind.config.js` and no `postcss.config.js`. `src/index.css` contained `@tailwind base`, `@tailwind components`, and `@tailwind utilities`, but there was no configured Tailwind/PostCSS pipeline to expand those directives.

The login screen used Tailwind utility classes almost exclusively (`min-h-screen`, `bg-white`, `p-8`, `rounded-3xl`, `w-full`, and similar). Because those utilities were not generated, the browser received mostly semantic HTML with default input/button presentation.

## Affected files

- `frontend/package.json`: dependencies existed, but configuration was missing.
- `frontend/src/index.css`: Tailwind directives were present without a compiler configuration.
- `frontend/src/pages/auth/Login.jsx`: depended on ungenerated utility classes.
- `frontend/src/main.jsx`: correctly imports `src/index.css`; import order was not the problem.
- `frontend/vite.config.js`: does not need a CSS plugin change; Vite delegates CSS processing to PostCSS when configured.

## Exact fix

1. Added `frontend/tailwind.config.js` with content globs for `index.html` and `src/**/*.{js,jsx}`.
2. Added `frontend/postcss.config.js` with Tailwind and Autoprefixer plugins.
3. Kept the existing centralized custom design tokens in `src/index.css`.
4. Rebuilt the login page using the shared design system and explicit auth layout classes, so it remains stable even as utility classes evolve.

## Verification

The frontend production build is the styling verification gate. It must complete successfully after the configuration fix, and the generated CSS must include both the custom design-system selectors and Tailwind utility selectors used by legacy/shared screens.
