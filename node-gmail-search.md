You will have to create a Node WebApp which can search, store and display results from a user's Gmail account.

The flow of the application will go something like this:

1. User visits the URL and logs in with her Google Account. 
2. The application stores the emails from last 30 days into a MongoDB database.
2. The home page renders. It will only have a search box where you can search for one single term. (ex. food, shooting, social)
3. Once the searh button is hit, the first 10 results from the email body will be shown in the search page.
4. When 1 of the 10 displayed search result is clicked - it opens a details page which lists all the messages in that email thread.
5. There should be a "back" button in your details page to take you back to the "search results" page that you came from

Conditions:
* Do not use any 3rd party Gmail libraries. You are supposed to use the node `request` and `request-promise` library to get the emails.
* In the database, Email threads should be saved instead of just messages.
* All the messages in a thread should be stored in one single entry without any duplicates.
* Use `git` from the first line of code you write and submit the solution as a Github repo post that.
* Use es6 constructs wherever possible.

Things to note:
* You dont have to worry about making the websire beautiful. We dont evaluvate based on how the page looks. But using Bootstrap / Foundation or Any other CSS is welcomed.
* But we do evaluvate how beautiful your code is. So try to write clean, pragmatic and testable code.