<p align="center">
  <img src="https://github.com/box/sdks/blob/master/images/box-dev-logo.png" alt= “box-dev-logo” width="30%" height="50%">
</p>

# React Sample App with Box Typescript SDK

This sample app demonstrates how to use the [Box Typescript SDK](https://github.com/box/box-typescript-sdk-gen) to authenticate a user and make API calls to the Box API. It is built using React and Typescript.

Read a step-by-step guide on how to build this app in this [Medium article]().

## Run the app

### Create a Box custom app and get the Developer Token

1. Use or create a [sandbox environment](https://support.box.com/hc/en-us/articles/360043697274-Managing-developer-sandboxes-for-Box-admins#:~:text=Using%20the%20Admin%20Console's%20Sandboxes,right%20corner%2C%20click%20Create%20Sandbox) or a [free account](https://account.box.com/signup/personal?tc=annual)
2. Navigate to [Dev Console](https://app.box.com/developers/console).
3. Create Box custom app.
4. Choose any authentication method (could be JWT or OAuth2 or CCG).
5. Go to the Configuration tab and get the Developer Token.
6. Ensure CORS is configured to allow requests from http://localhost:3000 in your Box App settings.

### Run the example app

1. Clone the this repository.
2. Install dependencies: `npm install`
3. Start the app by running `npm start`
4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser and provide the Developer Token.