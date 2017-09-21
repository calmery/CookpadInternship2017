
onerror = function( a, b, c ){
  alert( a )
  alert( b )
  alert( c )
}

function handleOpenURL( url ){
  setTimeout(function() {
    alert("レシピを開いています （" + url.split( '/' ).pop() + "）")
    main( url.split( '/' ).pop() )
  }, 0)
}

const highlight = ( materials, text ) => {
  materials.forEach( material => {
    text = text.replace( RegExp( material, 'g' ), '<span class="highlight">' + material + '</span>' )
  } )
  return text
}

const timer = {}

const resetTimer = index => {
  const t = timer[index]

  document.getElementById( 't' + index + '_setup' ).style.display = 'block'
  document.getElementById( 't' + index + '_start' ).style.display = 'none'
  document.getElementById( 't' + index + '_stop' ).style.display = 'none'

  t.stop()
  t.reset()

  const minutes = document.getElementsByClassName( 'timer_minutes_' + index )
  const seconds = document.getElementsByClassName( 'timer_seconds_' + index )

     const time = ( t.difference - t.elapsed ) / 1000

     const min = Math.floor( time / 60 )
     const sec = Math.round( time % 60 )

     for( let i=0; i<minutes.length; i++ ) minutes[i].innerHTML = min.toString().length > 1 ? min : '0' + min
     for( let i=0; i<seconds.length; i++ ) seconds[i].innerHTML = sec.toString().length > 1 ? sec : '0' + sec
}

const stopTimer = index => {
  const t = timer[index]

  document.getElementById( 't' + index + '_setup' ).style.display = 'none'
  document.getElementById( 't' + index + '_start' ).style.display = 'none'
  document.getElementById( 't' + index + '_stop' ).style.display = 'block'

  t.stop()
}

const startTimer = index => {
  const t = timer[index]

  t.start()

  document.getElementById( 't' + index + '_setup' ).style.display = 'none'
  document.getElementById( 't' + index + '_start' ).style.display = 'block'
  document.getElementById( 't' + index + '_stop' ).style.display = 'none'

  const minutes = document.getElementsByClassName( 'timer_minutes_' + index )
  const seconds = document.getElementsByClassName( 'timer_seconds_' + index )

  t.on( 'processing', () => {
     const time = ( t.difference - t.elapsed ) / 1000

     const min = Math.floor( time / 60 )
     const sec = Math.round( time % 60 )

     for( let i=0; i<minutes.length; i++ ) minutes[i].innerHTML = min
     for( let i=0; i<seconds.length; i++ ) seconds[i].innerHTML = sec
  } )
}

const hideMenu = () => {
  document.getElementById( 'background' ).style.display = 'none'
  document.getElementById( 'materialList' ).style.display = 'none'
}

const showMenu = () => {
  document.getElementById( 'background' ).style.display = 'block'
  document.getElementById( 'materialList' ).style.display = 'block'
}

let interv
let swiper

    const renderRecipe = recipeData => {
      // reset

      document.getElementById( 'recipes' ).innerHTML = ''
      document.getElementById( 'recipe_title' ).innerHTML = ''
      interv = null
      if( swiper !== undefined ) swiper.destroy()
      swiper = null

      const createTimer = text => {
        const n = text.match( /\d+分/ )
        if( n === null ) return new CookTimer( 0 )

        return new CookTimer( parseInt( n[0].replace( /分/, '' ) ) )
      }

      const createTimerElement = ( text, index ) => {
        const n = text.match( /\d+分/ )

        if( n === null )
          return ''

        const min = n[0].replace( /分/, '' )

        return `
          <div class="timer">

            <div class="timer_setup_btn" id="t${index}_setup" onClick="startTimer(${index})">
              <img src="resources/img/clock.png">${min}分 START
            </div>

            <div class="timer_start_btn" id="t${index}_start" style="display: none">
              <div class="timer_time">
                <span class="timer_minutes_${index}"></span>:<span class="timer_seconds_${index}"></span>
              </div>
              <div class="timer_stop_icon" onClick="stopTimer( ${index} )">
                <img src="resources/img/pose.png">
              </div>
              <div class="timer_reset_icon" onClick="resetTimer( ${index} )">
                <img src="resources/img/reset.png">
              </div>
            </div>

            <div class="timer_stop_btn" id="t${index}_stop" style="display: none">
              <div class="timer_time">
                <span class="timer_minutes_${index}"></span>:<span class="timer_seconds_${index}"></span>
              </div>
              <div class="timer_start_icon" onClick="startTimer( ${index} )">
                <img src="resources/img/start.png">
              </div>
              <div class="timer_reset_icon" onClick="resetTimer( ${index} )">
                <img src="resources/img/reset.png">
              </div>
            </div>
          </div>
        `
      }

      const el = document.getElementById( 'list' )
      recipeData.materials.forEach( material => {
        el.innerHTML +=
          '<div class="material"><div class="materialName">' + material.material + '</div>' +
          '<div class="materialAmount">' + material.amount + '</div></div>'
      } )

      const materials = recipeData.materials.map( m => m.material ).filter( i => i !== '' )
      const title = document.getElementById( 'recipe_title' ).innerHTML = recipeData.title
      const recipes = document.getElementById( 'recipes' )

      let index = 1

      let toggleElements = []
      let toggleIndex = {}
      let toggleUrl = {}

      recipeData.steps.forEach( step => {
      recipes.innerHTML += '<div class="swiper-slide">' + '<div class="step">'
      + (
        typeof step.image === 'string' && step.image !== undefined ? '<div class="step_image" style="background: url( ' + step.image + ' ); background-size: cover"></div>' :
        ( toggleElements.push('step_image_' + index), toggleIndex[index] = 0, toggleUrl[index] = step.image, '<div class="step_image" id="step_image_' + index + '" style="background: url( ' + step.image[0] + ' ); background-size: cover"></div>' )
      )
        + '<div class="step_number">' + index + '</div>'
        + '<div class="step_line"></div>'
      +   '<div class="step_text">'
            + highlight( materials, step.text )

            + (

                step.text.match( /\d+分/ ) !== null ? (timer[index] = createTimer( step.text ), createTimerElement( step.text, index )) : ''

             )


        +'</div>'
      + '</div></div>'

      index++
    } )

    const tick = () => {
        interv = setTimeout( () => {
          for( let i in toggleUrl ){
            const urls = toggleUrl[i]

            const length = urls.length

            if( ++toggleIndex[i] >= length ){
              toggleIndex[i] = 0
            }

            console.log( 'step_image_' + i )

            try {
              document.getElementById( 'step_image_' + i ).style.background = 'url(' + urls[toggleIndex[i]] + ')'
              document.getElementById( 'step_image_' + i ).style.backgroundSize = 'cover'
            } catch( error ){
              return false
            }
          }

          tick()
        }, 1000 )
    }

    swiper = new Swiper( '.swiper-container', {
      pagination: '.swiper-pagination',
      slidesPerView: 1,
      paginationClickable: true,
      spaceBetween: 0,
      keyboardControl: true,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
    } )

    tick()

  }

    // Onload Functions

    const setupTimer = timeId => {
      console.log( timeId )
    }

    // Example

    /*

    renderRecipe(  )

    */


  const main = recipeId => {

    // const recipeId = window.location.href.split( '/' ).pop()

    const requestUrl = 'http://la-cook.herokuapp.com/api/recipe/' + ( recipeId === 'demo' ? '99999' : recipeId )

    if( recipeId === 'demo' ){
      renderRecipe( {
        id: '1715052',
        publishDate: '12/04/17',
        updateDate: '17/04/10',
        materials: [
          { material: 'さつまいも', amount: '150ｇ' },
          { material: '卵', amount: '2個' },
          { material: 'ごま', amount: '大さじ３' },
          { material: 'マヨネーズ', amount: '大さじ１' },
          { material: 'お酢', amount: '大さじ１' },
          { material: '醤油', amount: '大さじ1/2' }
        ],
        image: 'https://img.cpcdn.com/recipes/1715052/280/745ea77289c5d10333d8215902605a9c.jpg?u=2335344&p=1334597882',
        description: '600れぽ＆ニュース掲載❀感謝♪\nメイン材料たった２つ！\n胡麻の風味が全体を包み、卵と薩摩芋のほっこりコラボです♡＾＾',
        advice: '下準備さえできていればすぐにできる簡単レシピです＾＾薩摩芋は温かいうちに調味料に漬け込む事で、味が良く馴染みます＾＾お子さんにもきっと食べ易いと思います。お好みでマスタードやブラックペッパーでアレンジ下さい。',
        history: '胡麻を一杯とりたいと思った事がきっかけです。',
        user: {
          id: '2335344',
          image: 'https://img.cpcdn.com/users/2335344/22x22c/a0b09b0bb06f3c4a6c542f629ee99d3b.jpg?u=2335344&p=1452946902',
          screen_name: '時花菜'
        },
        title: '簡単☆薩摩芋と茹で卵のほっこりサラダ',
        steps: [ { text: '鍋に卵を入れる', image: 'resources/recipe/recipe_01.jpg' }
               , { text: '卵がかぶるくらいの量の水を入れる', image: 'resources/recipe/recipe_02.jpg' }
               , { text: '15分ゆでる', image: 'resources/recipe/recipe_03.jpg' }
               , { text: '流水で卵を冷やす', image: 'resources/recipe/recipe_04.jpg' }
               , { text: 'すり鉢でごまを擦る', image: 'resources/recipe/recipe_05.jpg' }
               , { text: 'さつまいもは一口サイズに切る', image:  ['resources/recipe/recipe_06_a.jpg', 'resources/recipe/recipe_06_b.jpg']  }
               , { text: '切ったさつまいもをレンジで6分温める', image: 'resources/recipe/recipe_07.jpg' }
               , { text: 'ボールにマヨネーズ・お酢・醤油を入れる', image: 'resources/recipe/recipe_08.jpg' }
               , { text: '混ぜる', image: 'resources/recipe/recipe_09.png' }
               , { text: '温めたさつまいもを加えて馴染ませる', image: 'resources/recipe/recipe_10.jpg' }
               , { text: '擦ったごまを加え，充分に混ぜる', image: 'resources/recipe/recipe_11.jpg' }
               , { text: 'ゆで卵の殻をむく', image: 'resources/recipe/recipe_12.jpg' }
               , { text: 'ゆで卵をちぎってボールの中に入れる', image: 'resources/recipe/recipe_13.jpg' }
               , { text: 'ざっくり混ぜる', image: 'resources/recipe/recipe_14.jpg' }
               , { text: 'できあがり！！', image: 'resources/recipe/recipe_15.jpg' } ]
      } )
    } else {
      try {
        fetch( requestUrl )
          .then( ( response ) => {
              // body = JSON.parse( body )

              return response.json()
          } )
            .then( json => renderRecipe( json ) )
      } catch( error ){
        $.get( requestUrl, ( data ) => {
          renderRecipe( data )
        } )
      }

    }

  }

document.addEventListener('deviceready', () => main( 'demo' ) )
