import express from 'express'
import gplay from 'google-play-scraper'
import { get_categories_data } from './utils.js'


const app = express()
const port = 3000

async function get_detailed_search(term, lang, amount) {
    let app_ids = [];

    try {
        const data = await gplay.search({
            term: term,
            lang: lang,
            num: amount
        });
        for (let i in data) {
            let app_id = data[i].appId;
            app_ids.push(app_id);
        }
    } catch (error) {
        console.error("Error occurred during search:", error);
    }

    let app_datas = []

    for (let id in app_ids) {
        try {
            const data = await gplay.app({appId:app_ids[id]})
            app_datas.push(data)
        } catch(error) {
            console.error("Error Occurrued During Process", error)
        }
    }

    return app_datas
}



app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.get("/list/categories", (req, res) => {
    let categories = get_categories_data()
    res.json(categories)
})

app.get("/app", (req, res) => {
    gplay.app({appId:req.query.app_id}).then(data => res.send(data))
})

app.get("/list/apps", (req, res) => {
    gplay.list({
        category: req.query.category,
        collection: req.query.collection,
        amount: req.query.amount,
        country: req.query.country
    }).then(
        data => res.send(data)
    )
})

app.get("/search", (req,res) => {
    let results = get_detailed_search(req.query.term, req.query.lang, req.query.amount)
    results.then(data => res.send(data))
})

app.get("/developer", (req,res) => {
    gplay.developer({devId:req.query.developer, fullDetail:true}).then(data => res.send(data))
})

app.get("/suggest", (req, res) => {
    gplay.suggest({term:req.query.term, lang:req.query.lang}).then(data => res.send(data))
})

app.get("/reviews", (req, res) => {
    gplay.reviews({
        appId:req.query.app_id,
        sort:gplay.sort.RATING,
        num:req.query.amount,
        lang:req.query.lang
    }).then(data => res.send(data['data']))
})

app.get("/similars", (req, res) => {
    gplay.similar({
        appId:req.query.app_id,
        fullDetail:true
    }).then(data => res.send(data))
})



app.listen(port, () => {
    console.log(`Example App Listening on http://localhost:${port}`)
})
