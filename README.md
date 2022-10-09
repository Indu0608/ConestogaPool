Deployment Instructions

#To deploy the website, clone the content of GitHub repository to a local folder and complete the below steps.
1)	Run npm install, to install the dependencies.
2)	Create an account to configure Google Maps API and obtain an API key for accessing the location information.
Go thru the link to generate the API Key: https://tinyurl.com/2p9ftjf3
3)	Create an account in PayPal sandbox and obtain an API key for making test payments through PayPal sandbox.
Link for setting up the key: https://developer.paypal.com/
4)	Once the above keys are generated, create a .env file in the main directory and populate the keys as below.

 GEOCODER_API_KEY=<Google Maps API Key>
 PAYPAL_CLIENT_ID=<PayPal Client Key>
 PAYPAL_CLIENT_SECRET=<PayPal Secret>
5)	Once the .env file is created run the application using node index command.

#How to Create the Database
 
To create a MongoDB Database, login to MongoDB on the website and setup the MongoDB Atlas. Once it is configured, the database and associated collected can be created thru application itself.
 
#How to Install and Configure the Web Site
 
To configure the website, create an account on Heroku and push the changes to Heroku app.
Link for setting up Heroku App: https://tinyurl.com/27jnhsvb
Once the Heroku app is setup, go to setting and add the Config Vars which were added in the .env file.
