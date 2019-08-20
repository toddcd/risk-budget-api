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
    getPortfolioById(db, port_id){
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
        'portfolios:funds:fund_perfs:perf_id': 'perf.perf_id',
        'portfolios:funds:fund_perfs:perf_date': 'perf.perf_date',
        'portfolios:funds:fund_perfs:perf': 'perf.perf',
        'portfolios:funds:fund_perfs:date_created': 'f.date_created',
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
        'funds:fund_perfs:perf_id': 'perf.perf_id',
        'funds:fund_perfs:perf_date': 'perf.perf_date',
        'funds:fund_perfs:perf': 'perf.perf',
        'funds:fund_perfs:date_created': 'f.date_created',
    }
]


module.exports = PortfolioService;
