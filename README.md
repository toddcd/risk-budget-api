# Risk budgeting tool api

This is the client api for the Risk Budgeting Tool

https://td3-riskbudget.now.sh/

## Route Endpoints
1. '/api/register'
    * POST '/register'

2. '/api/auth'
    * POST '/login'  
      
3. '/api/portfolio'
    * GET '/' , Return all portfolios for the current user
    * POST '/', Creates a new portfolio when passing in a port object with fund and perf data
    * GET '/:port_id', Returns an exiting portfolio along with fund and perf data  
    * DELETE '/:port_id', Deletes a portfolio along with all associated funds and perf data  
    * PATCH '/:port_id', Updates the weight, risk, or return variables for a portfolios funds

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`


