import View from './components/view'
import Link from './components/link'

export let _Vue

export function install(Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    //判段i.data.registerRouteInstance是否已定义，相当于i?.data?.registerRouteInstance
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      //相当于i.data.registerRouteInstance(vm,callval)
      i(vm, callVal)
    }
  }

  //确保每个组件实例均能注入以下代码
  Vue.mixin({
    beforeCreate() {
      // this为当前vue应用实例
      if (isDef(this.$options.router)) {
        //给vue实例添加以下路由相关属性
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed() {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get() { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get() { return this._routerRoot._route }
  })

  //路由安装的同时，顺便注册了组件RouterView和组件RouterLink
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
