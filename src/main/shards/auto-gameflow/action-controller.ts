import { TimeoutTask } from '@main/utils/timer'
import { formatError } from '@shared/utils/errors'

import type { AutoGameflowMainContext } from './context'

export class AutoGameflowActionController {
  private readonly _autoAcceptTask = new TimeoutTask(this._acceptMatch.bind(this))
  private readonly _playAgainTask = new TimeoutTask(this._playAgain.bind(this))
  private readonly _reconnectTask = new TimeoutTask(this._reconnect.bind(this))

  constructor(private readonly _context: AutoGameflowMainContext) {}

  get isAutoAcceptStarted() {
    return this._autoAcceptTask.isStarted
  }

  startAutoAccept(delay: number) {
    this._autoAcceptTask.start({ delay })
  }

  cancelAutoAcceptTask() {
    this._autoAcceptTask.cancel()
  }

  cancelAutoAccept(reason?: string) {
    const { logger, state } = this._context

    if (state.willAcceptAt > 0) {
      if (this._autoAcceptTask.isStarted) {
        this._autoAcceptTask.cancel()
        if (reason === 'accepted') {
          logger.info(`Already accepted match`)
        } else if (reason === 'declined') {
          logger.info(`Already declined match`)
        } else {
          logger.info(`Auto-accept cancelled - ${reason || 'unknown reason'}`)
        }
      }
      state.clearAutoAccept()
    }
  }

  startPlayAgain(delay: number) {
    this._playAgainTask.start({ delay })
  }

  cancelPlayAgain() {
    this._playAgainTask.cancel()
  }

  scheduleReconnect(delay: number) {
    const { state } = this._context

    state.setReconnectAt(Date.now() + delay)
    this._reconnectTask.start({ delay })
  }

  cancelReconnect() {
    const { state } = this._context

    state.setReconnectAt(-1)
    this._reconnectTask.cancel()
  }

  private async _acceptMatch() {
    const { ipc, leagueClient, logger, namespace, state } = this._context

    if (leagueClient.data.gameflow.phase !== 'ReadyCheck') {
      logger.info('Auto-accept skipped: current phase is not ReadyCheck', {
        phase: leagueClient.data.gameflow.phase
      })
      state.clearAutoAccept()
      return
    }

    const readyCheck = leagueClient.data.matchmaking.readyCheck
    if (readyCheck) {
      if (readyCheck.playerResponse === 'Accepted') {
        logger.info('Auto-accept skipped: match already accepted')
        state.clearAutoAccept()
        return
      }
      if (readyCheck.playerResponse === 'Declined') {
        logger.info('Auto-accept skipped: match already declined')
        state.clearAutoAccept()
        return
      }
      if (readyCheck.state && readyCheck.state !== 'InProgress') {
        logger.info(`Auto-accept skipped: ready check state is ${readyCheck.state}`)
        state.clearAutoAccept()
        return
      }
    }

    try {
      await leagueClient.api.matchmaking.accept()
      logger.info('Successfully accepted match')
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : '')
      const isReadinessError =
        typeof errorMsg === 'string' &&
        (errorMsg.includes('Failed to indicate team builder ready check readiness') ||
          errorMsg.includes('RPC_ERROR') ||
          leagueClient.data.gameflow.phase !== 'ReadyCheck')

      if (isReadinessError) {
        logger.info('Auto-accept aborted: ready check was already completed or cancelled', {
          phase: leagueClient.data.gameflow.phase,
          message: errorMsg
        })
      } else {
        ipc.sendEvent(namespace, 'error-accept-match', formatError(error))
        logger.warn(`Failed to accept match`, error)
      }
    } finally {
      state.clearAutoAccept()
    }
  }

  private async _playAgain() {
    const { leagueClient, logger } = this._context

    try {
      logger.info('Play again, returning to lobby')
      await leagueClient.api.lobby.playAgain()
    } catch (error) {
      logger.warn(`Failed to play again`, error)
    }
  }

  private async _reconnect() {
    const { leagueClient, logger, state } = this._context

    try {
      logger.info('Reconnect! Attempting to reconnect')
      await leagueClient.api.gameflow.reconnect()
    } catch (error) {
      logger.warn(`Failed to reconnect`, error)
    } finally {
      state.setReconnectAt(-1)
    }
  }
}
