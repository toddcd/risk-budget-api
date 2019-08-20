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
        const newPort = {
            user_id: 1,
            'name': data.name,
        }
        return db('portfolio')
            .insert(newPort)
            .returning('port_id')
            .then(id => {
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

                return db('fund')
                    .insert(newFunds)
                    .returning('fund_id')

            }).then(fundIds => {
                data.funds.map(async (fund, i) => {
                    const perf = fund.fund_perfs.map(perf => {
                        const p = {
                            fund_id: fundIds[i],
                            perf_date: perf.perf_date,
                            perf: perf.perf,
                        }
                        return p
                    })

                    await db('fund_perf').insert(perf)
                })
            })
            .catch(err => {

            })
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


async function insertPerformance(db, perf){



}


module.exports = PortfolioService;


// db.transaction(trx => {
//     return db.transacting(trx)
//         .insert(newPort)
//         .into('portfolio')
//         .returning('port_id')
//         .then(portId => {
//             console.log('TRANSACTING')
//             for (let fund in data.funds){
//                 const newFund = {
//                     port_id: portId,
//                     name: fund.name,
//                     ticker: fund.ticker,
//                     weight: fund.weight,
//                     risk : fund.risk,
//                     return: fund.return,
//                 }
//                 db.insert(newFund)
//                     .into('fund')
//             }
//         })
//         .then(trx.commit)
//         .catch(err => {
//             trx.rollback()
//             throw err;
//         })
// })
