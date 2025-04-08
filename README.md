# CookCompass
CookCompass is your one stop shop for all your cooking needs! 

Provide whatever leftover ingredients you currently have on hand and CookCompass will tailor your search to recipes that you can make. No more hassle finding the perfect recipe only to find out you're missing one or two ingredients. No more scrolling through long-winded backstories, CookCompass will only show information you need to make the recipe. 

# Project Links
Website: https://cookcompassapp.netlify.app/

Project Video: TO BE ADDED

## Features
Here's what makes CookCompass stand out:

Hands free assistance: Got your hands dirty while cooking? No problem! CookCompass has a hands-free mode that reads out the recipe, so you can focus on creating delicious meals without touching your device.

Translate recipes into your desired language: Found a foreign recipe that interests you in another language. Translates the recipe into a desired language.

Unit Conversion: Specify and convert unit measurements you want to use.


# Getting Started: Instructions for Local Deployment 
## 1. Prequisites
Ensure the following are installed:
- Node.js
  - Go to https://nodejs.org and install Node.js (LTS)
- npm (Node package manager)
- Git
  - Go to https://git-scm.com/downloads and install Git.

## 2. Clone the Repository
```git@github.com:CMPT-276-SPRING-2025/final-project-04-winds.git```

## 3. Install Dependencies
- Navigate to your root directory
```cd final-project-04-winds```

- Run ```npm install``` 

## 4. Set Up Environment Variables
- Create a file named `.env` in the root directory and add your API keys
```
REACT_APP_SPOONACULAR_API_KEY= your_spoonacular_api_key
REACT_APP_GOOGLE_CLOUD_API_KEY= your_google_cloud_api_key
```

## 5. Run the Development Server
- In your terminal, run the following:
```npm start```

- If successful, in your terminal you should see:
`Compiled successfully!

You can now view cook-compass in the browser.

  Local:            http://localhost:3000
  ...
`

- Open your browser and navigate to `http://localhost:3000`!


# Tech Stack
- Frontend:
- APIs: Spoonacular API, Google Cloud Translate API
- Deployment: Netlify
- Testing: 

# File Structure
```
.
├── docs                    # Documentation files (alternatively `doc`)
│   ├── propsal             # Proposal
│   ├── design              # Design Documentation
│   ├── final               # Final Documentation
│   ├── communication       # Communication Logs
│   ├── ai-disclosure       # AI Disclosures
│   └── ...          
├── src                     # Source files (alternatively `lib` or `app`)
├── test                    # Automated tests (alternatively `spec` or `tests`)
├── tools                   # Tools and utilities
└── README.md
```

Also, update your `README.md` file with the team and project information. You can find details on writing GitHub Markdown [here](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) as well as a [handy cheatsheet](https://enterprise.github.com/downloads/en/markdown-cheatsheet.pdf).














# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).<br>



## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
