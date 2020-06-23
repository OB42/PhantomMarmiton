# PhantomMarmiton
## Setup
Add your API key in phantombuster.cson

    [name: 'TechniCalTestMarmiton'
    apiKey: 'YOUR_API_KEY_HERE'
    scripts:
        'marmiton.js': 'build/index.js']
Run:

    npm install
    npm run build
    npm run deploy
   You can now use the marmiton phantom in your org store.

## Input

    {
    "searchURL": "https://www.marmiton.org/recettes/recherche.aspx?type=all&aqt=falafel",
    "pages": 2
    }

