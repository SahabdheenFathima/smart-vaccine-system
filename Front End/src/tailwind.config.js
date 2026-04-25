/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // <- Adjust this based on your project folder
  ],
  theme: {
    extend: {
      colors: {
        orangeCustom: '#e0830a',
        skyCustom: 'rgb(51, 185, 247)',
        skyBorder: 'rgb(7, 167, 235)',
        blackTransparent: 'rgba(30,27,27,0.15)',
        headerBg: 'rgba(19,18,18,0.8)',
        linkHover: 'red',
        linkActive: 'rgb(51, 17, 187)',
      },
      fontSize: {
        '5xl-custom': '5em',
        'join': '64px',
        'label': '22px',
        'small-para': '15px',
      },
      borderRadius: {
        'xl-custom': '30px',
        'lg-custom': '15px',
      },
      backgroundImage: {
        'fantasy-landscape': "url('/src/assets/images/fantasy-landscape-background-hd-1080p-144206.jpg')",
      },
      boxShadow: {
        'custom': '4px 4px 10px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
