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
                    //res.json(portfolios)
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
                res.status(200)
                    //.location(path.posix.join(req.originalUrl, `/${portfolio.port_id}`))
                    .json(`Created new portfolio id ${id}!`)
            }).catch(next)
    })
    ,

    PortfolioRouter
        .route('/:port_id')
        .all(checkPortfolioExists)
        .get((req, res, next) => {
            res.json(PortfolioService.serializePortfolios(res.portfolio))
        })
        .delete((req, res) => {
            const {port_id} = req.params
            PortfolioService.deletePortfolio(
                req.app.get.db,
                port_id
            ).then(numRowsAffected => {
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
                error: `Bicycle id ${port_id} doesn't exist`
            })

        res.portfolio = portfolio
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = PortfolioRouter;