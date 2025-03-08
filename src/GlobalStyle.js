import { createGlobalStyle } from 'styled-components';

// sets the font to Inria Sans
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inria Sans', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inria Sans', sans-serif;
  }

  p, a, li, span {
    font-family: 'Inria Sans', sans-serif;
  }
`;

export default GlobalStyle;