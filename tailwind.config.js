module.exports = {
  content: ["./src/**/*.*",

  ],
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      transitionDelay: {
        '2000': '2000ms',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
