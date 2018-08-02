/**
 * Create by zx1984
 * 2018/1/23 0023.
 * https://github.com/zx1984
 */
import util from './index'

const dom = {
  /**
   * 添加样式
   * @param className 样式名
   * @param $el 元素节点
   */
  addClass (className, $el) {
    $el.classList.add(className)
  },
  removeClass (className, $el) {
    $el.classList.remove(className)
  },
  hasClass (className, $el) {
    return $el.classList.contains(className)
  },
  /**
   * 事件绑定
   * @param $el
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @param useCapture 是否在冒泡阶段
   */
  addEvent ($el, eventName, handler, useCapture = false) {
    if (!$el || !eventName || !handler) return
    if ($el.length) {
      for (let i = 0; i < $el.length; i++) {
        $el[i].addEventListener(eventName, handler, useCapture)
      }
    } else {
      $el.addEventListener(eventName, handler, useCapture)
    }
  },
  removeEvent ($el, eventName, handler, useCapture = false) {
    if (!$el || !eventName || !handler) return
    if ($el.length) {
      for (let i = 0; i < $el.length; i++) {
        $el[i].removeEventListener(eventName, handler, useCapture)
      }
    } else {
      $el.removeEventListener(eventName, handler, useCapture)
    }
  },
  /**
   * 创建DOM元素
   * @param tag 标签名称
   * @param opts 标签属性
   * @returns {Element}
   */
  createElm (tag = 'div', opts) {
    let elm = document.createElement(tag)
    if (opts && opts instanceof Object) {
      for (let key in opts) {
        if (opts.hasOwnProperty(key)) {
          elm.setAttribute(key, opts[key])
        }
      }
    }
    return elm
  },

  /**
   * 创建Vdom
   * @param vnode
   * @returns {*}
   */
  createVdom (vnode) {
    if (!vnode) return null
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode)
    }
    let tag = vnode.tag
    let attrs = vnode.attrs
    let child = vnode.child
    if (!tag && !attrs && !child) return null
    // 创建dom
    const $el = dom.createElm(vnode.tag || 'div', vnode.attrs)
    if (Array.isArray(child) && child.length) {
      let $itemNode
      child.forEach(item => {
        $itemNode = dom.createVdom(item)
        if ($itemNode) $el.appendChild($itemNode)
      })
    } else if (child && typeof child === 'string') {
      $el.appendChild(document.createTextNode(child))
    }
    return $el
  },

  /**
   * 设置已有DOM节点的标签（实际是改变DOM节点标签）
   * @param oldElm DOM节点对象
   * @param newTagName 新标签名称
   * @returns {Element}
   */
  changeTagName ($el, newTagName) {
    if (!newTagName || $el.nodeName === newTagName.toUpperCase()) return $el
    // 新的dom对象
    const $new = dom.createElm(newTagName)
    // 获取旧标签名
    const oldTagName = $el.nodeName.toLowerCase()
    // 获取旧元素class/id/style属性，并赋予新DOM对象
    const className = $el.className
    const id = $el.id
    // 是否有自定义style样式
    const style = $el.getAttribute('style')

    let inner = ''
    if (oldTagName === 'ul') {
      const $ulChildren = util.slice($el.children)
      $ulChildren.forEach($item => {
        inner += $item.innerHTML
      })
    } else if (oldTagName === 'blockquote') {
      inner = $el.innerText
    } else {
      inner = $el.innerHTML
    }

    // blockquote
    if (newTagName === 'blockquote') {
      inner = `<p style="color: inherit">${inner}</p>`
    } else if (newTagName === 'ul') {
      inner = `<li style="color: inherit">${inner}</li>`
    }

    if (className) $new.className = className
    if (id) $new.id = id
    if (style) $new.setAttribute('style', style)

    $new.innerHTML = inner
    return $new
  },

  /**
   * 查找当前元素节点(textNode、ElemNode等)，在$context内的父根节点
   * @param currentNode 当前DOM节点
   * @param $context
   * @returns {*}
   */
  findParagraphRootNode (currentNode, $context) {
    let $node = currentNode
    let $parentNode
    do {
      $parentNode = $node.parentNode
      if ($parentNode === $context) {
        return $node
      } else {
        $node = $parentNode
      }
    } while ($parentNode)
    return null
  },

  /**
   * 获取满足selector条件$el的最近的父级元素
   * @param selector
   * @param $el
   * @returns {*}
   */
  closest (selector, $el) {
    const matchesSelector = $el.matches
      || $el.webkitMatchesSelector
      || $el.mozMatchesSelector
      || $el.msMatchesSelector

    while ($el) {
      if (matchesSelector.call($el, selector)) {
        break
      }
      // console.log($el)
      $el = $el.parentNode
    }
    return $el
  },

  /**
   * 判断元素innerText是否为空
   * 如果元素内存在hr分割线，则不为空
   * @param $el
   * @param checkBr 是否忽略<br>标签
   * @returns {boolean}
   */
  isEmptyInner ($el, checkBr) {
    if (!$el) util.err(`Function 'isEmptyInner($el)', $el is ${$el}`)
    const $childs = $el.children
    return util.isEmpty($el.innerText)
      && ($childs.length === 0
        || $childs[0].nodeType !== 1
        || $childs[0].nodeName === 'BR' )
  },

  /**
   * $el是否为HTML元素节点
   * @param $el
   * @returns {*|boolean}
   */
  isHTMLElement ($el) {
    return $el && $el instanceof HTMLElement
  },

  /**
   * dom节点选择器
   * @param selector 元素id、class、属性等
   * @param context 作用域，默认为documet
   * @returns {*}
   */
  query (selector, context = document) {
    return context.querySelector(selector)
  },

  queryAll (selector, context = document) {
    return context.querySelectorAll(selector)
  },

  /**
   * 获取$el的css样式
   * @param $el
   * @param prop 指定属性
   * @returns {*}
   */
  getStyle ($el, prop) {
    if (!dom.isHTMLElement($el)) return null
    const style = window.getComputedStyle($el, null)
    let result = null
    if (prop) {
      try {
        result = style[util.strToHump(prop)]
      } catch (e) {}
    } else {
      result = style
    }
    return result
  },

  /**
   * 获取最大z-index
   * @returns {Number}
   */
  maxZIndex () {
    const $els = document.getElementsByTagName('*')
    let $el, css, zindex
    let arr = []
    for (let i = 0; i < $els.length; i++) {
      $el = $els[i]
      if ($el.nodeType !== 1) continue
      css = dom.getStyle($el) || {}
      if (css.position !== 'static') {
        zindex = util.int(css.zIndex)
        if (zindex > 0) arr.push(zindex)
      }
    }
    return util.int(Math.max.apply(null, arr))
  },

  /**
   * 在当前元素节点el后插入新节点newNode
   * @param el 当前元素节点
   * @param newNode 要插入的新元素节点
   */
  insertAfter (el, newNode) {
    const nextNode = el.nextElementSibling
    const parentNode = el.parentNode
    if (nextNode === null) {
      parentNode.appendChild(newNode)
    } else {
      parentNode.insertBefore(newNode, nextNode)
    }
  },

  /**
   * 将元素插入到$rangeElm位置
   * @param $el
   * @param $rangeElm
   * @param className $p元素class样式
   * @returns {*} 返回新的$rangeElm
   */
  insertToRangeElm ($el, $rangeElm, className) {
    // if (typeof editDisabled === 'undefined' && typeof className === 'boolean') {
    //   editDisabled = className
    //   className = null
    // }
    let $p
    // 获取或创建$p元素
    if (dom.isEmptyInner($rangeElm, true)) {
      $p = $rangeElm
      $p.innerHTML = ''
      $p.appendChild($el)
    } else {
      $p = dom.createElm('p')
      $p.appendChild($el)
      // 将p元素插入到$rangeElm之后
      dom.insertAfter($rangeElm, $p)
    }
    // 添加样式名
    if (className) {
      $p.className = className
    }
    // 如果是在$content结尾插入的话，新增一占位段落
    const $content = $p.parentNode
    if ($content && $content.lastElementChild === $p) {
      return dom.insertParagraph($content)
    } else {
      return $p.nextElementSibling
    }
  },

  /**
   * 查找元素节点el的兄弟节点
   * @param el
   * @param 可选参数，className兄弟节点包含的样式名
   * @returns {*}
   */
  siblings (el, className) {
    let arr = []
    let elmNodes = []
    const siblings = el.parentNode.childNodes
    // 只取元素节点
    siblings.forEach((item) => {
      if (item.nodeType === 1 && item !== el) {
        elmNodes.push(item)
      }
    })

    if (className) {
      let reg = new RegExp(`\\b(${className})\\b`)
      elmNodes.forEach((item) => {
        if (reg.test(item.className)) {
          arr.push(item)
        }
      })
    } else {
      arr = elmNodes
    }
    return arr.length ? arr : null
  },

  /**
   * 创建a标签链接字符串
   * @param url 链接地址
   * @param name 链接名称
   * @returns {string}
   */
  createLinkStr (url, name) {
    if (!url) return ''
    url = url + ''
    name = name || (url.length > 20 ? url.substr(0, 20) + '...' : url)
    return `<a href="${url}" target="_blank" alt="${name}">${name}</a>`
  },

  /**
   * 设置或获取$el data-属性
   * @param $el
   * @param suffix data-后缀
   * @param value 值
   * @returns {*}
   */
  data ($el, suffix, value) {
    if (!$el || !suffix) return null
    if (dom.isHTMLElement($el)) {
      if (value) {
        $el.setAttribute(`data-${suffix}`, value)
      } else {
        return $el.getAttribute(`data-${suffix}`)
      }
    }
    return null
  },

  /**
   * 往字符串中插入字符串
   * @param str 原字符串
   * @param insertString 需要插入的字符串
   * @param position 插入位置
   * @returns {string}
   */
  insertStr (str, insertString, position) {
    return str.substring(0, position) + insertString + str.substring(position)
  },

  /**
   * 元素后面插入分割线
   * @param el
   */
  insertHr ($el) {
    let $p = dom.isEmptyInner($el) ? $el : dom.createElm('p')
    $p.innerHTML = '<hr>'
    dom.insertAfter($el, $p)
  },

  /**
   * 获取当前元素节点最近的文本节点
   * @param $el
   * @returns {*}
   */
  getTextNode ($el) {
    while ($el && $el.nodeType === 1) {
      // 当$el.childNodes[0] == <br>时，不能继续获取childNode
      if ($el.childNodes[0]) {
        $el = $el.childNodes[0]
      } else {
        break
      }
    }
    return $el
  },

  /**
   * 获取$item在$list中的索引
   * @param $item
   * @param $list
   * @returns {number}
   */
  findIndex ($item, $list) {
    for (let i = 0; i < $list.length; i++) {
      if ($item === $list[i]) {
        return i
      }
    }
    return -1
  },

  /**
   * 插入空行
   * @param $parent 父级
   * @returns {*|Element} p元素
   */
  insertParagraph ($parent) {
    const $p = dom.createElm('p')
    $p.innerHTML = '<br>'
    if (dom.isHTMLElement($parent)) {
      $parent.appendChild($p)
    }
    return $p
  },

  /**
   * overflow: hidden
   * @param $el
   */
  lock ($el) {
    if (typeof $el === 'undefined') {
      $el = dom.query('body')
    }
    if (dom.isHTMLElement($el)) {
      $el.style.overflow = 'hidden'
    }
  },

  /**
   * overflow: ''
   * @param $el
   */
  unlock ($el) {
    if (typeof $el === 'undefined') {
      $el = dom.query('body')
    }
    if (dom.isHTMLElement($el)) {
      $el.style.overflow = ''
    }
  }
}

export default dom
