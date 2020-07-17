/*
 * @Descripttion: 
 * @version: 
 * @Author: jie.niu
 * @Date: 2020-07-17 16:56:25
 * @LastEditors: jie.niu
 * @LastEditTime: 2020-07-17 17:24:48
 */ 
let _Vue = null
export default class VueRouter {
    static install (Vue) {
        // 1、判断当前插件是否已经被安装
        if(VueRouter.install.installed) {
            return
        }
        VueRouter.install.installed = true
        // 2、把Vue构造函数记录到全局变量
        _Vue = Vue
        // 3、把创建的Vue实例传入的router对象注入到Vue实例上
        // 混入
        _Vue.mixin({
            beforeCreate() {
                if(this.$options.router) {
                    _Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            },
        })
    }

    constructor(options) {
        this.options = options
        this.routeMap = {}
        this.data = _Vue.observable({
            current: '/'
        })
    }

    init() {
        this.createRouteMap()
        this.initComponents(_Vue)
        this.initEvent()
    }

    createRouteMap() {
        // 遍历所有的路由规则，把路由规则解析成键值对的形式，存储到routeMap中
        this.options.routes.forEach(route => {
            this.routeMap[route.path] = route.component
        })
    }

    initComponents(Vue) {
        Vue.component('router-link', {
            props: {
                to: String
            },
            // runtimeCompiler: false
            render(h) {
                return h('a', {
                    attrs: {
                        href: this.to
                    },
                    on: {
                        click: this.clickHandler
                    }
                }, [this.$slots.default])
            },
            methods: {
                clickHandler(e) {
                    console.log('clickhandler--->', this.to)
                    if(this.$router.options.mode == 'history') {
                        history.pushState({}, '', this.to)
                    }else {
                        window.location.hash = this.to
                    }
                    this.$router.data.current = this.to
                    e.preventDefault()
                }
            }
            // runtimeCompiler: true
            // template: '<a :href="to"><slot></slot></a>'  
        })

        const self = this
        Vue.component('router-view', {
            render(h) {
                const component = self.routeMap[self.data.current]
                return h(component)
            }
        })
    }

    initEvent() {
        if(this.options.mode == 'history') {
            window.addEventListener('popstate', () => {
                this.data.current = window.location.pathname
            })
        }else {
            window.addEventListener('hashchange', () => {
                console.log('hashchange--->', window.location.hash.substr(1))
                this.data.current = window.location.hash.substr(1)
            })
        }
    }
}