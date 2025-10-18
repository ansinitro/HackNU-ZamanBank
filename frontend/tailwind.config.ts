    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        // You might need to adjust this depending on your project structure
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    };