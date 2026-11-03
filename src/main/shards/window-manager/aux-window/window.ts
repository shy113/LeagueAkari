import { i18next } from '@main/i18n'
import {
  NATIVE_SUPPORT,
  getLeagueClientWindowPlacement,
  getPidsByName,
  isProcessForeground
} from '@main/native'
import icon from '@resources/LA_ICON.ico?asset&asarUnpack'
import { Notification } from 'electron'
import { compareShallow, computed } from 'mobx'
import { z } from 'zod'

import { BaseAkariWindow } from '../base-akari-window'
import type { WindowManagerMainContext } from '../context'
import { getPositionWithSnap, repositionToAlignLeagueClientUx } from '../window-position-service'
import { AuxWindowDockPlacement, AuxWindowSettings, AuxWindowState } from './state'

export class AkariAuxWindow extends BaseAkariWindow<AuxWindowState, AuxWindowSettings> {
  static readonly NAMESPACE_SUFFIX = 'aux-window'
  static readonly HTML_ENTRY = 'aux-window.html'
  static readonly TITLE = 'Mini Akari'
  static readonly BASE_WIDTH = 220
  static readonly BASE_HEIGHT = 152
  static readonly EXPANDED_HEIGHT = 282
  static readonly MIN_WIDTH = 180
  static readonly MIN_HEIGHT = 120

  static readonly QUICK_CLOSE_TIP_STORAGE_KEY = 'quickCloseTip'

  private _autoDockIntervalId: NodeJS.Timeout | null = null
  public isExpanded: boolean = false
  private _wasHiddenByClientMinimize = false
  private _isAutoDockTopmost = false
  private _userDismissed = false
  private _cachedLeaguePids: number[] = []
  private _lastPidRefreshTime = 0
  private _wasClientForeground = false
  private _lastClientPlacement: { x: number; y: number; width: number; height: number } | null =
    null

  constructor(_context: WindowManagerMainContext) {
    const state = new AuxWindowState()
    const settings = new AuxWindowSettings()

    super(_context, AkariAuxWindow.NAMESPACE_SUFFIX, state, settings, {
      baseWidth: AkariAuxWindow.BASE_WIDTH,
      baseHeight: AkariAuxWindow.BASE_HEIGHT,
      minWidth: AkariAuxWindow.MIN_WIDTH,
      minHeight: AkariAuxWindow.MIN_HEIGHT,
      htmlEntry: AkariAuxWindow.HTML_ENTRY,
      rememberPosition: true,
      rememberSize: false,
      repositionWindowIfInvisible: true,
      settingSchema: {
        enabled: { default: settings.enabled, schema: z.boolean() },
        autoShow: { default: settings.autoShow, schema: z.boolean() },
        showInTaskbar: { default: settings.showInTaskbar, schema: z.boolean() },
        autoDockToLeagueClient: { default: settings.autoDockToLeagueClient, schema: z.boolean() },
        dockPlacement: {
          default: settings.dockPlacement,
          schema: z.enum(['top-left', 'bottom-left', 'top-right', 'bottom-right'])
        }
      },
      browserWindowOptions: {
        title: AkariAuxWindow.TITLE,
        icon: icon,
        width: AkariAuxWindow.BASE_WIDTH,
        height: AkariAuxWindow.BASE_HEIGHT,
        show: false,
        skipTaskbar: !settings.showInTaskbar,
        frame: false,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 8, y: 8 }
      }
    })

    this._context.ipc.onCall(this._namespace, 'setExpanded', async (_, expanded: boolean) => {
      this.setExpanded(expanded)
    })
  }

  public setExpanded(expanded: boolean) {
    this.state.setExpanded(expanded)
    if (this._window && !this._window.isDestroyed()) {
      const targetHeight = expanded ? AkariAuxWindow.EXPANDED_HEIGHT : AkariAuxWindow.BASE_HEIGHT
      this._window.setContentSize(AkariAuxWindow.BASE_WIDTH, targetHeight)
      if (this.settings.autoDockToLeagueClient) {
        this._lastClientPlacement = null
        this._trackAndAlignWithLeagueClient()
      }
    }
  }

  private _startAutoDockTracking() {
    if (this._autoDockIntervalId) {
      return
    }

    this._autoDockIntervalId = setInterval(() => {
      this._trackAndAlignWithLeagueClient()
    }, 50)
  }

  private _stopAutoDockTracking() {
    if (this._autoDockIntervalId) {
      clearInterval(this._autoDockIntervalId)
      this._autoDockIntervalId = null
    }
    this._lastClientPlacement = null
    this._wasHiddenByClientMinimize = false
    this._isAutoDockTopmost = false
    this._wasClientForeground = false
    if (this._window && !this._window.isDestroyed() && !this.settings.pinned) {
      this._window.setAlwaysOnTop(false)
    }
  }

  private async _refreshLeaguePids() {
    const now = Date.now()
    if (now - this._lastPidRefreshTime < 2000) {
      return
    }
    this._lastPidRefreshTime = now
    try {
      const [renderPids, uxPids, clientPids] = await Promise.all([
        getPidsByName('LeagueClientUxRender.exe'),
        getPidsByName('LeagueClientUx.exe'),
        getPidsByName('LeagueClient.exe')
      ])
      const authPid = this._leagueClient.state.auth?.pid
      const set = new Set<number>([
        ...renderPids,
        ...uxPids,
        ...clientPids,
        ...(authPid ? [authPid] : [])
      ])
      this._cachedLeaguePids = Array.from(set)
    } catch {
      this._cachedLeaguePids = this._leagueClient.state.auth?.pid
        ? [this._leagueClient.state.auth.pid]
        : []
    }
  }

  private _isLeagueClientForeground(): boolean {
    if (!NATIVE_SUPPORT.isProcessForeground.available) {
      return false
    }

    if (this._window?.isFocused()) {
      return true
    }

    void this._refreshLeaguePids()

    try {
      return this._cachedLeaguePids.some((pid) => isProcessForeground(pid))
    } catch {
      return false
    }
  }

  private _updateZOrder() {
    if (!this._window || this._window.isDestroyed()) {
      return
    }

    const level = this.settings.pinned ? 'screen-saver' : 'normal'
    if (!this._isAutoDockTopmost) {
      this._isAutoDockTopmost = true
      this._window.setAlwaysOnTop(true, level)
    }

    const isClientForeground = this._isLeagueClientForeground()
    if (isClientForeground && !this._wasClientForeground) {
      this._window.moveTop()
    }
    this._wasClientForeground = isClientForeground
  }

  private _shouldBeVisibleByGameflow(): boolean {
    if (!this.settings.autoShow) {
      return false
    }

    if (this._leagueClient.state.connectionState !== 'connected') {
      return false
    }

    if (!this.state.ready) {
      return false
    }

    const phase = this._leagueClient.data.gameflow.phase
    const hasLobby = Boolean(this._leagueClient.data.lobby.lobby)

    switch (phase) {
      case 'ChampSelect':
        if (this._leagueClient.data.champSelect.session?.isSpectating) {
          return false
        }

        if (
          this._windowManager.opggWindow.settings.enabled &&
          (this._windowManager.opggWindow.settings.autoShow ||
            this._windowManager.opggWindow.state.show)
        ) {
          return false
        }

        return true
      case 'Lobby':
      case 'Matchmaking':
      case 'ReadyCheck':
        return true
      default:
        return hasLobby
    }
  }

  private _trackAndAlignWithLeagueClient() {
    if (!this._window || this._window.isDestroyed() || !this.settings.autoDockToLeagueClient) {
      return
    }

    if (!NATIVE_SUPPORT.getLeagueClientWindowPlacement.available) {
      return
    }

    const info = getLeagueClientWindowPlacement()
    if (!info) {
      this._lastClientPlacement = null
      return
    }

    const isClientMinimized = info.isMinimized || (info.width < 200 && info.height < 50)

    if (isClientMinimized) {
      this._lastClientPlacement = null
      this._isAutoDockTopmost = false
      this._wasClientForeground = false
      if (this.state.show && !this._wasHiddenByClientMinimize) {
        this._wasHiddenByClientMinimize = true
        this._window.hide()
      }
      return
    }

    if (this._wasHiddenByClientMinimize) {
      this._wasHiddenByClientMinimize = false
      if (
        !this._userDismissed &&
        (this.settings.autoShow ? this._shouldBeVisibleByGameflow() : true)
      ) {
        this.showOrRestore(true)
      }
    } else if (!this.state.show && !this._userDismissed && this._shouldBeVisibleByGameflow()) {
      this.showOrRestore(true)
    }

    if (!this.state.show) {
      return
    }

    this._updateZOrder()

    const clientBounds = {
      x: info.left,
      y: info.top,
      width: info.width,
      height: info.height
    }

    if (
      this._lastClientPlacement &&
      this._lastClientPlacement.x === clientBounds.x &&
      this._lastClientPlacement.y === clientBounds.y &&
      this._lastClientPlacement.width === clientBounds.width &&
      this._lastClientPlacement.height === clientBounds.height
    ) {
      return
    }

    this._lastClientPlacement = clientBounds

    const winBounds = this._window.getBounds()
    const targetWidth = AkariAuxWindow.BASE_WIDTH
    const targetHeight = this.state.expanded
      ? AkariAuxWindow.EXPANDED_HEIGHT
      : AkariAuxWindow.BASE_HEIGHT

    if (winBounds.width !== targetWidth || winBounds.height !== targetHeight) {
      this._window.setContentSize(targetWidth, targetHeight)
    }

    const { x, y } = getPositionWithSnap(
      { ...winBounds, width: targetWidth, height: targetHeight },
      clientBounds,
      this.settings.dockPlacement || 'top-right'
    )

    if (winBounds.x !== x || winBounds.y !== y) {
      this._window.setPosition(x, y)
    }
  }

  override hide() {
    this._userDismissed = true
    this._wasHiddenByClientMinimize = false
    this._isAutoDockTopmost = false
    this._wasClientForeground = false
    super.hide()
  }

  override showOrRestore(inactive = false) {
    this._userDismissed = false
    this._wasHiddenByClientMinimize = false
    if (this._window && !this._window.isDestroyed()) {
      const targetHeight = this.state.expanded
        ? AkariAuxWindow.EXPANDED_HEIGHT
        : AkariAuxWindow.BASE_HEIGHT
      this._window.setContentSize(AkariAuxWindow.BASE_WIDTH, targetHeight)
      super.showOrRestore(inactive)
      if (this.settings.autoDockToLeagueClient) {
        this._lastClientPlacement = null
        this._window.moveTop()
        this._trackAndAlignWithLeagueClient()
      }
    }
  }

  private _watchAuxWindow() {
    const showTiming = computed(() => {
      if (!this.settings.autoShow) {
        return 'ignore'
      }

      if (this._leagueClient.state.connectionState !== 'connected') {
        return 'hide'
      }

      if (!this.state.ready) {
        return 'ignore'
      }

      return this._shouldBeVisibleByGameflow() ? 'show' : 'hide'
    })

    // normally show & hide
    this._mobxUtils.reaction(
      () => showTiming.get(),
      (timing) => {
        this._userDismissed = false
        if (timing === 'ignore') {
          return
        }

        if (timing === 'show') {
          this.showOrRestore()
        } else {
          this._wasHiddenByClientMinimize = false
          this._isAutoDockTopmost = false
          super.hide()
        }
      },
      { fireImmediately: true }
    )

    this._mobxUtils.reaction(
      () => this.settings.showInTaskbar,
      (showInTaskbar) => {
        this._window?.setSkipTaskbar(!showInTaskbar)
      },
      { fireImmediately: true }
    )

    this._mobxUtils.reaction(
      () => [this.settings.enabled, this._windowManager.state.isManagerFinishedInit] as const,
      ([enabled, finishedInit]) => {
        if (!finishedInit) {
          return
        }

        if (enabled) {
          this.createWindow()
        } else {
          this.close(true)
        }
      },
      { fireImmediately: true, delay: 500, equals: compareShallow }
    )

    // auto-dock tracking reaction: keep tracking whenever connected and autoDock is enabled
    this._mobxUtils.reaction(
      () =>
        [
          this.settings.enabled,
          this.settings.autoDockToLeagueClient,
          this._leagueClient.state.connectionState
        ] as const,
      ([enabled, autoDock, connectionState]) => {
        if (enabled && autoDock && connectionState === 'connected') {
          this._startAutoDockTracking()
          this._trackAndAlignWithLeagueClient()
        } else {
          this._stopAutoDockTracking()
        }
      },
      { fireImmediately: true, equals: compareShallow }
    )

    // 快速关闭会提供提示
    this._settingService._getFromStorage(AkariAuxWindow.QUICK_CLOSE_TIP_STORAGE_KEY).then((tip) => {
      if (!tip) {
        let _lastShow = -Infinity
        let inARow = 0
        let cb: Function | null = null
        cb = this._mobxUtils.reaction(
          () => this.state.show,
          (show) => {
            if (show) {
              _lastShow = Date.now()
            } else {
              if (Date.now() - _lastShow < 1000) {
                inARow++

                if (inARow < 5) {
                  return
                }

                new Notification({
                  title: i18next.t('window-manager-main.aux-window.quickClose.title'),
                  body: i18next.t('window-manager-main.aux-window.quickClose.body'),
                  icon: icon
                }).show()

                this._settingService._saveToStorage(
                  AkariAuxWindow.QUICK_CLOSE_TIP_STORAGE_KEY,
                  true
                )
                cb?.()
              } else {
                inARow = 0
              }
            }
          }
        )
      }
    })

    this._ipc.onCall(
      this._namespace,
      'repositionToAlignLeagueClientUx',
      (_, placement: AuxWindowDockPlacement) => {
        if (placement) {
          this.settings.setDockPlacement(placement)
        }
        this._lastClientPlacement = null
        if (this._window) {
          repositionToAlignLeagueClientUx(this._window, placement || this.settings.dockPlacement)
        }
      }
    )
  }

  override async onInit() {
    await super.onInit()

    this._watchAuxWindow()
  }

  override async onDispose() {
    this._stopAutoDockTracking()
    await super.onDispose()
  }

  protected override getStatePropKeys() {
    return ['expanded'] as const
  }

  protected override getSettingPropKeys() {
    return [
      'enabled',
      'autoShow',
      'showInTaskbar',
      'autoDockToLeagueClient',
      'dockPlacement'
    ] as const
  }
}
