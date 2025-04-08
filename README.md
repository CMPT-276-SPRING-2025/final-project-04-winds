# CookCompass
CookCompass is your one stop shop for all your cooking needs! 

Provide whatever leftover ingredients you currently have on hand and CookCompass will tailor your search to recipes that you can make. No more hassle finding the perfect recipe only to find out you're missing one or two ingredients. No more scrolling through long-winded backstories, CookCompass will only show information you need to make the recipe. 

# Group Information
- Group Name: Winds
- Group Number: 4

# Project Links
Website: https://cookcompassapp.netlify.app/

Project Video: TO BE ADDED

## Features
### Recipe Finder
Users can input ingredients they have or want to use, and the app returns recipes that minimize missing ingredients. The ingredient input includes autocomplete suggestions to streamline the process. For example, entering bread, butter, garlic may return garlic bread. This helps busy users quickly find suitable recipes—even for picky eaters.

### Simplify Recipes
Recipes are presented in a step-by-step format with the click of a button, transforming dense recipe text into a more digestible structure. This helps users follow instructions easily without needing to search through large blocks of text.

### Filtered Recipes
Users can filter recipes by dietary preferences (e.g., vegetarian, keto) or exclude specific ingredients (e.g., nuts, gluten). This flexible filtering supports diverse dietary needs without overwhelming users with irrelevant recipes.

### Text-To-Speech
Recipes can be read aloud in multiple languages. This makes cooking more accessible for users with limited literacy or those who want to listen while their hands are busy.

### Page Translation
Users can translate entire recipes into their preferred language. This enables users to access recipes from different cultures or better understand instructions in a familiar language.

### Multilingual Search Queries
Users can input ingredients in their native language, which are then translated into English. The system includes a language selector to avoid incorrect auto-detection and improve translation accuracy—ideal for users unfamiliar with ingredient names in English.

# Getting Started: Instructions for Local Deployment 
## 1. Prequisites
Ensure the following are installed:
- Node.js
  - Go to https://nodejs.org and install Node.js (LTS)
- npm (Node package manager)
- Git
  - Go to https://git-scm.com/downloads and install Git.

## 2. Clone the Repository
```
git@github.com:CMPT-276-SPRING-2025/final-project-04-winds.git
```

## 3. Install Dependencies
- Navigate to your root directory
```
cd final-project-04-winds
```

- Run ```npm install``` 

## 4. Set Up Environment Variables
- Create a file named `.env` in the root directory and add your API keys
```
REACT_APP_SPOONACULAR_API_KEY= your_spoonacular_api_key
REACT_APP_GOOGLE_CLOUD_API_KEY= your_google_cloud_api_key
```

## 5. Run the Development Server
- In your terminal, run the following:
```
npm start
```

- If successful, in your terminal you should see:
```
Compiled successfully!

You can now view cook-compass in the browser.

  Local:            http://localhost:3000
  ...
```

- Open your browser and navigate to `http://localhost:3000`!


# Tech Stack
- Frontend: React
- Styling: CSS
- APIs: Spoonacular API, Google Cloud Translate API, Google Cloud Text-to-Speech API
- Deployment: Netlify
- Testing: Jest


# License
This project is licensed under the MIT License. It is intended for educational and training purposes.
