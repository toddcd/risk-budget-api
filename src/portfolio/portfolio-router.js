const express = require('express');
const path = require('path');
const PortfolioService = require('./portfolio-service');
const {requireAuth} = require('../middleware/jwt-auth');

const PortfolioRouter = express.Router();
const jsonBodyParser = express.json({limit: '50mb'});

PortfolioRouter
    .route('/')
    // .all(requireAuth)
    .get((req, res, next) => {
        PortfolioService.getPortfolios(req.app.get('db'), 1)
            .then(portfolios => {
                // if current user has no portfolios
                // return 204 for not content
                if (portfolios.length === 0) {
                    res.status(204).end()
                } else {
                    res.json(PortfolioService.serializePortfolios(portfolios))
                }
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {data} = req.body

        PortfolioService.insertNewPortfolio(
            req.app.get('db'),
            data
        )
            .then(id => {
                console.log(id) // Todo - need the ID of newly created portfolio
                res.status(200)
                //.location(path.posix.join(req.originalUrl, `/${id}`))
                    .json(`Created new portfolio id ${id}!`)
            }).catch(next)
    }),

    PortfolioRouter
        .route('/:port_id')
        .all(checkPortfolioExists)
        .get((req, res, next) => {
            res.json(PortfolioService.serializePortfolios(res.portfolio))
        })
        .delete((req, res) => {
            const {port_id} = req.params

            // grab fund Ids for deleting child fund and perf records
            const funds = PortfolioService.serializePortfolios(res.portfolio).funds
            const fundIds = funds.map(fund => {
                return fund.fund_id
            })

            PortfolioService.deletePortfolio(
                req.app.get('db'),
                port_id,
                fundIds
            ).then(numRowsAffected => {
                res.status(204).end()
            })
        })
        .patch(jsonBodyParser, (req, res) => {
            const {name, funds} = req.body
            const portToUpdate = {name, funds}

            const numberOfValues = Object.values(portToUpdate).filter(Boolean).length

            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: `Request body must contain: 'name', 'funds' or both`
                })
            }

            const updateName = PortfolioService.updateName(
                req.app.get('db'),
                req.params.port_id,
                portToUpdate.name
            )

            const updateFunds = PortfolioService.updateFunds(
                req.app.get('db'),
                portToUpdate.funds
            )

            Promise.all([updateName, updateFunds])
                .then(numRowsAffected => {
                    res.status(204).end()
                })
        })

/* async/await syntax for promises */
async function checkPortfolioExists(req, res, next) {
    const port_id = req.params.port_id
    try {
        const portfolio = await PortfolioService.getPortfolioById(
            req.app.get('db'),
            port_id
        )

        if (portfolio.length === 0)
            return res.status(404).json({
                error: `Portfolio id ${port_id} doesn't exist`
            })

        res.portfolio = portfolio
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = PortfolioRouter;