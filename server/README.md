# Server for the TOIA 2.0 System
1. Place .env file in the root directory
2. Update the env file with database username and password
3. Run `npm install --save` to install all dependencies
4. Install sox

windows

    choco install sox.portable 

macOS

    brew install sox

linux

    sudo apt install sox

5. Update env file in server directory with correct location of the json file for speech to text

Finally, run `nodemon app.js` to fire up the server!


# Important Notes

1. The ids of the y/n-questions in the "configs/onboarding_questions.json" file are 18 and 19. If this is ever changed, then the changes should be reflected in the queries of the following files:

a. 