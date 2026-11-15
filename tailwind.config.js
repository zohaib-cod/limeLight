/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        assistant: ['Assistant', 'sans-serif'],
        visbyMedium: ['VisbyCFMedium', 'sans-serif'],
        visbyLight: ['VisbyCF-Light', 'sans-serif'],
        visbyBold: ['VisbyCF-Bold', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#0000ee',
          redTranslucent: '#cf0c1dbf',
          red: '#cf0c1d',
          coral: '#e74040',
        },
        surface: {
          white: '#ffffff',
          gray: '#f3f3f3',
          black: '#000000',
          dark: '#121212',
          darkMuted: '#1212121a',
        },
        textColor: {
          dark: '#121212',
          muted: '#121212bf',
          subtle: '#121212b3',
          pure: '#000000',
          light: '#ffffff',
        }
      },
      boxShadow: {
        'soft-layered': 'rgba(18, 18, 18, 0.05) 0px 4px 5px 0px',
        'modal-depth': 'rgba(0, 0, 0, 0.35) 0px 0px 10px 0px',
      },
      borderRadius: {
        'limelight-sm': '3px',
        'limelight-md': '5px',
        'limelight-lg': '6px',
      },
      maxWidth: {
        '1600': '1600px',
        '1315': '1315px',
        '742': '742px',
      }
    },
  },
  plugins: [],
}

