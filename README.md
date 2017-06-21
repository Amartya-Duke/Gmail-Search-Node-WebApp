A Node WebApp which can search, store and display results from a user's Gmail account.

The flow of the application:

1. User visits the URL and logs in with his/her Google Account, this is one time process. 
2. The application stores the emails from last n days into a MongoDB database, n is provided by user.
2. The home page renders. It will has a search box where you can search for one single term. (ex. food, shooting, social)
3. Once the search button is hit, all results from the email body will be shown in the search page and the matched keywords in the result are highlighted.
4. When one of the displayed search result is clicked - it opens dropdown which lists all the messages in that email thread.
