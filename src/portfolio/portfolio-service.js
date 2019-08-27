const xss = require('xss')
const Treeize = require('treeize')

const PortfolioService = {
    getPortfolios(db, user_id) {
        return db.from('portfolio AS p')
            .select(
                'p.user_id',
                ...portFieldUser,
                ...fundFieldUser,
            ).innerJoin(
                'fund AS f',
                'f.port_id',
                'p.port_id'
            )
            .where('p.user_id', user_id)
    },
    getPortfolioById(db, port_id) {
        return db.from('portfolio AS p')
            .select(
                'p.port_id',
                'p.name',
                'p.date_created',
                ...fundFieldPort,
                ...perfFieldPort,
            ).innerJoin(
                'fund AS f',
                'f.port_id',
                'p.port_id'
            ).innerJoin(
                'fund_perf AS perf',
                'perf.fund_id',
                'f.fund_id'
            )
            .where('p.port_id', port_id)
    },

    insertNewPortfolio(db, data) {
        let newPortId = 0;
        const newPort = {
            user_id: 1,
            name: data.name,
        }
        // 1. Create new Portfolio and get ID
        return db('portfolio')
            .insert(newPort)
            .returning('port_id')
            .then(id => {
                newPortId = id;
                const newFunds = data.funds.map(fund => {
                    return {
                        port_id: parseInt(id),
                        name: fund.name,
                        ticker: fund.ticker,
                        weight: fund.weight,
                        risk: fund.risk,
                        return: fund.return,
                    }
                })

                // 2. Create associated new Funds and get fund IDs
                return db('fund')
                    .insert(newFunds)
                    .returning('fund_id')
            }).then(fundIds => {
                data.funds.forEach(async (fund, i) => {
                    const perf = fund.fund_perf.map(per => {
                        const perfDate = Object.keys(per)[0]
                        const perfValue = Object.values(per)[0]
                        const p = {
                            fund_id: fundIds[i],
                            perf_date: perfDate,
                            perf: parseFloat(perfValue),
                        }
                        return p
                    })

                    // 3. Create associated fund performance
                    await db('fund_perf')
                        .insert(perf)
                        .catch(err => {
                            console.log(err)
                        })
                })
            })

        return newPortId[0];
    },
    deletePortfolio(db, port_id, fundIds) {
        // 1. Delete Fund Performance
        return db('fund_perf')
            .whereIn('fund_id', fundIds)
            .del()
            .then(result => {
                // 2. Delete Funds
                return db('fund')
                    .where('port_id', port_id)
                    .del()
                    .then(result => {
                        // 3. Delete Portfolio
                        return db('portfolio')
                            .where('port_id', port_id)
                            .delete()
                    })
            })
    },

    updateName(db, port_id, name) {
        if (name) {
            return db('portfolio')
                .where({port_id})
                .update({name: name})
        } else {
            return Promise.resolve()
        }
    },

    updateFunds(db, funds) {
        if (funds) {
            Promise.all(funds.map((fund, idx) => {
                const fund_id = funds[idx].fund_id
                const update = {
                    weight: funds[idx].weight,
                    risk: funds[idx].risk,
                    return: funds[idx].return
                }
                return db('fund')
                    .where({fund_id})
                    .update(update)
            }))
        } else {
            return Promise.resolve()
        }
    },

    serializePortfolios(portfolios) {
        let portTree = new Treeize()
        portTree.grow(portfolios)
        return portTree.getData()[0]
    },

};
const portFieldUser = [
    {
        'portfolios:port_id': 'p.port_id',
        'portfolios:name': 'p.name',
        'portfolios:date_created': 'p.date_created',
    }
]
const fundFieldUser = [
    {
        'portfolios:funds:fund_id': 'f.fund_id',
        'portfolios:funds:name': 'f.name',
        'portfolios:funds:ticker': 'f.ticker',
        'portfolios:funds:weight': 'f.weight',
        'portfolios:funds:risk': 'f.risk',
        'portfolios:funds:return': 'f.return',
        'portfolios:funds:date_created': 'f.date_created',
    }
]
const perfFieldUser = [
    {
        'portfolios:funds:fund_perfs:perf_date': 'perf.perf_date',
        'portfolios:funds:fund_perfs:perf': 'perf.perf',
    }
]

const fundFieldPort = [
    {
        'funds:fund_id': 'f.fund_id',
        'funds:name': 'f.name',
        'funds:ticker': 'f.ticker',
        'funds:weight': 'f.weight',
        'funds:risk': 'f.risk',
        'funds:return': 'f.return',
        'funds:date_created': 'f.date_created',
    }
]
const perfFieldPort = [
    {
        'funds:fund_perfs:perf_date': 'perf.perf_date',
        'funds:fund_perfs:perf': 'perf.perf',
    }
]

module.exports = PortfolioService;
