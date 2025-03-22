import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'Montserrat', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #ffffff;
  }

  /* Общие стили для корневого элемента */
  #root {
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
    will-change: opacity;
    background-color: #ffffff;
  }
  
  body.loading #root {
    opacity: 0;
  }
  
  body.loaded #root {
    opacity: 1;
  }
`; 