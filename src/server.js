import express from 'express'
import path from 'path'

import {
  search,
  fetchRecipe
} from './cookpad'

const app = express()
const api = express()

app.use( express.static( path.resolve( __dirname, '../public' ) ) )

app.get( '/:id', ( _, response ) => {
	response.sendFile( path.resolve( __dirname, '../public/index.html' ) )
} )

app.use( '/api', api )

// Routing

api.get( '/search', ( request, response ) => {
  search( request.query )
    .then( result => response.json( result ) )
    .catch( () => response.json( [] ) )
} )

api.get( '/recipe/:id', ( request, response ) => {
  fetchRecipe( request.params.id )
    .then( result => response.json( result ) )
    .catch( () => response.json( {} ) )
} )

// Launch

app.listen( process.env.PORT || 3000 )
