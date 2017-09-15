import querystring from 'querystring'
import url from 'url'

import { JSDOM } from 'jsdom'
import request from 'request'

const host = 'https://cookpad.com/'

const endpoints = {
  search: '/s/post',
  recipe: '/recipe'
}

/**
 * @param {string} endpoint
 * @param {Object} queries
 * @return {string}
 */
const createUrl = ( endpoint, queries ) => url.resolve( host, endpoint ) + '?' + querystring.encode( queries )

/**
 * @param {string} html
 * @return {Object}
 */
const parseHtmlResponse = html => ( new JSDOM( html ) ).window

/**
 * @param {string} body
 * @return {Object}
 */
const parseSearchResponse = body => {
  const window = parseHtmlResponse( body )

  const recipes = window.document.getElementsByClassName( 'recipe-preview' )

  const result = []

  for( let i=0; i<recipes.length; i++ ){
    const recipe = recipes[i]

    // Professional recipes don't hold author information. Skip !
    if( recipe.attributes[1] === undefined )
      continue

    const id          = recipe.children[0].id.split( '_' ).pop()
    const title       = recipe.children[1].children[0].textContent.replace( /\n/g, '' )
    const authorId    = recipe.attributes[1].textContent
    const authorName  = recipe.children[1].children[1].children[1].textContent
    const description = recipe.children[1].children[3].textContent.slice( 1, -1 )
    const image       = recipe.children[0].children[0].children[0].src
    result.push( {
      id         : id,
      title      : title,
      description: description,
      image      : image,
      user       : {
        id         : authorId,
        screen_name: authorName,
      }
    } )
  }

  return result
}

/**
 * @param {Object} queries
 * @return {Object} Promise object
 */
const search = queries => {
  return new Promise( ( resolve, reject ) => {
    if( queries.keyword === undefined && queries.purpose === undefined )
      reject()

    // Endpoint

    const endpoint = createUrl( endpoints.search, queries )

    console.log( endpoint )

    // Get request

    request.get( endpoint, ( error, response, body ) => {
      if( error )
        reject( error )

      if( response.statusCode < 200 || 299 < response.statusCode )
        reject()

      const result = parseSearchResponse( body )

      resolve( result )
    } )
  } )
}

/**
 * @param {string} recipeId
 * @return {Object} Promise object
 */
const fetchRecipe = recipeId => {
  return new Promise( ( resolve, reject ) => {
    try {
      if( recipeId === undefined )
        reject()

      request.get( url.resolve( host, endpoints.recipe + '/' + recipeId ), ( error, response, html ) => {
        if( error )
          reject( error )

        if( response.statusCode < 200 || 299 < response.statusCode )
          reject()

        const document = ( new JSDOM( html ) ).window.document

        const recipe = document.getElementById( 'recipe' )

        const ingredients_list = document.getElementById( 'ingredients_list' )
        const materials = []
        for( let i=0; i<ingredients_list.children.length; i++ ){
          const splited = ingredients_list.children[i].textContent.slice( 1, -1 ).split( '\n' )
          const material = splited[0]
          const amount = splited[1]
          materials.push( {
            material: material,
            amount: amount
          } )
        }

        const _steps = document.getElementById( 'steps' )
        const steps = []
        for( let i=0; i<_steps.children.length; i++ ){
          if( _steps.children[i].children.length !== 0 ){
            let image = ''
            try {
              image = _steps.children[i].children[0].children[1].children[0].children[0].children[0].attributes['data-large-photo'].textContent
            } catch( e ) {
              // pass
            }
            steps.push( { text: _steps.children[i].children[0].textContent.slice( 10, -3 ), image: image } )
          }
        }

        const recipe_id_and_published_date = document.getElementById( 'recipe_id_and_published_date' ).children
        const recipeId = recipe_id_and_published_date[0].textContent.slice( 1, -1 ).split( ':' ).pop().replace( ' ', '' )
        const publishDate = recipe_id_and_published_date[1].textContent.split( ':' ).pop().replace( ' ', '' ).slice( 0, -1 )
        const updateDate = recipe_id_and_published_date[2].textContent.split( ':' ).pop().replace( ' ', '' ).slice( 0, -1 )

        const data = {
          id: recipeId,
          steps: steps,
          publishDate: publishDate,
          updateDate: updateDate,
          materials: materials,
          title: recipe.children[3].children[0].children[0].textContent.slice( 1, -1 ),
          image: recipe.children[3].children[1].children[0].src,
          // largeImage: recipe.children[3].children[1].children[0].attributes['data-large-photo'].textContent,
          description: document.getElementById( 'description' ).children[0].textContent.slice( 1, -1 ),
          advice: document.getElementById( 'advice' ).textContent.slice( 1, -1 ),
          history: document.getElementById( 'history' ).textContent.slice( 1, -1 ),
          user: {
            id: document.getElementById( 'recipe_author_info_wrapper' ).children[1].href.split( '/' ).pop(),
            icon: document.getElementById( 'recipe_author_info_wrapper' ).children[0].src,
            screen_name: document.getElementById( 'recipe_author_info_wrapper' ).children[1].textContent
          }
        }

        resolve( data )
      } )
    } catch( error ){
      reject( error )
    }
  } )
}

// Exports

export { search, fetchRecipe }
