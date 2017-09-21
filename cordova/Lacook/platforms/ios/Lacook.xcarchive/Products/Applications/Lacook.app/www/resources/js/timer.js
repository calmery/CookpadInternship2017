class CookTimer {

  constructor( minutes, seconds ){
    this.difference   = ( ( minutes || 0 ) * 60 + ( seconds || 0 ) ) * 1000
    this.callback     = {}
    this.elapsed      = 0
    this.isProcessing = false
  }

  start(){
    this.isProcessing = true

    const isFunction = fn => typeof fn === 'function'

    const tick = latest => {
      if( this.isProcessing === true ){
        setTimeout( () => {
          const now = ( new Date() ).getTime()

          this.elapsed += now - latest

          if( this.elapsed >= this.difference ){
            this.stop()

            if( isFunction( this.callback.processed ) )
              this.callback.processed( timer.elapsed )
          } else {
            if( isFunction( this.callback.processing ) )
              this.callback.processing( timer.elapsed )

            tick( now )
          }
        }, 500 )
      }
    }

    tick( ( new Date() ).getTime() )
  }

  stop(){
    this.isProcessing = false
  }

  reset(){
    this.elapsed = 0
  }

  on( event, listener ){
    this.callback[event] = listener
  }

  getUnixTime(){
    return this.difference - this.elapsed
  }

  getTime(){
    const unixTime = this.getUnixTime()
    return unixTime / 1000
  }

}
