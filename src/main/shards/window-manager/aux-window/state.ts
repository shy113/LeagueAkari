import { Rectangle } from 'electron'
import { makeAutoObservable, observableRef } from 'mobx'

export type AuxWindowDockPlacement = 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right'

export class AuxWindowSettings {
  enabled: boolean = true
  autoShow: boolean = true
  opacity: number = 1
  pinned: boolean = false
  showInTaskbar: boolean = false
  autoDockToLeagueClient: boolean = true
  dockPlacement: AuxWindowDockPlacement = 'top-right'

  setAutoDockToLeagueClient(autoDockToLeagueClient: boolean) {
    this.autoDockToLeagueClient = autoDockToLeagueClient
  }

  setDockPlacement(dockPlacement: AuxWindowDockPlacement) {
    this.dockPlacement = dockPlacement
  }

  setShowInTaskbar(showInTaskbar: boolean) {
    this.showInTaskbar = showInTaskbar
  }

  setOpacity(opacity: number) {
    this.opacity = opacity
  }

  setPinned(pinned: boolean) {
    this.pinned = pinned
  }

  setAutoShow(autoShow: boolean) {
    this.autoShow = autoShow
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  constructor() {
    makeAutoObservable(this)
  }
}

export class AuxWindowState {
  status: 'normal' | 'maximized' | 'minimized' = 'normal'

  focus: 'focused' | 'blurred' = 'focused'

  /**
   * 对应 Electron 的 ready 事件
   */
  ready: boolean = false

  show: boolean = true

  expanded: boolean = false

  trackedBounds: Rectangle | null = null

  setStatus(status: 'normal' | 'maximized' | 'minimized') {
    this.status = status
  }

  setFocus(focus: 'focused' | 'blurred') {
    this.focus = focus
  }

  setReady(ready: boolean) {
    this.ready = ready
  }

  setShow(show: boolean) {
    this.show = show
  }

  setExpanded(expanded: boolean) {
    this.expanded = expanded
  }

  setTrackedBounds(bounds: Rectangle | null) {
    this.trackedBounds = bounds
  }

  constructor() {
    makeAutoObservable(this, {
      trackedBounds: observableRef
    })
  }
}
