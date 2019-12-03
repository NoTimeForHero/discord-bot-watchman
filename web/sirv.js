const sirv = require('sirv');
const polka = require('polka');
const cors = require('cors')({ origin:true });
const livereload = require('rollup-plugin-livereload');

const assets = sirv('public', {
});

const port = 5000;

livereload('public')

polka()
    .use(cors)
    .use(assets)
    .listen(port)