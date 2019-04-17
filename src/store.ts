import { AssetUnit } from '@kava-labs/crypto-rate-utils'
import { connect, IlpSdk, LedgerEnv, ReadyUplinks } from '@kava-labs/switch-api'
import BigNumber from 'bignumber.js'
import { createHmac } from 'crypto'
import Vue from 'vue'
import Vuex from 'vuex'
import { BehaviorSubject } from 'rxjs'

Vue.use(Vuex)

const hmac = (key: string, message: string) =>
  createHmac('sha256', key)
    .update(message)
    .digest()
    .toString('hex')

export interface Uplink {
  id: string
  unit: (amount?: BigNumber.Value) => AssetUnit
  assetScale: number
  balance$: BehaviorSubject<BigNumber>
  incomingCapacity$: BehaviorSubject<BigNumber>
  outgoingCapacity$: BehaviorSubject<BigNumber>
  totalSent$: BehaviorSubject<BigNumber>
  totalReceived$: BehaviorSubject<BigNumber>
  activeDeposit: null | Promise<void>
  activeWithdrawal: null | Promise<void>
  canDeposit: boolean
  canWithdraw: boolean
  getInternal: () => ReadyUplinks
}

/**
 * ROUTES
 */

type Route = HomeRoute | SwapRoute | LoadingSpinner | WelcomeRoute

export interface SwapRoute {
  name: 'swap'
  sourceUplink: string
  destinationUplink: string
  isStreaming: boolean
}

export interface LoadingSpinner {
  name: 'loading'
}

export interface WelcomeRoute {
  name: 'welcome'
}

export type HomeRoute = {
  name: 'home'
} & MetaRoute

/** States existing within the home route */
export type MetaRoute =
  /** Default screen to select an uplink to deposit, swap, or withdraw (no prompt) */
  | {
      meta: 'select-source-uplink'
    }
  /** After source uplink is selected, prompt to select the uplink to receive */
  | {
      meta: 'select-destination-uplink'
      selectedSourceUplink: string
    }
  /** Deposit dialog */
  | {
      meta: 'deposit'
      id: string // ID of the upink deposited to
    }
  /** Withdraw dialog */
  | {
      meta: 'withdrawal'
      id: string
    }
  /** Config dialog */
  | {
      meta: 'config'
    }

export interface State {
  ledgerEnv: LedgerEnv | null
  route: Route
  api?: Readonly<IlpSdk>
  uplinks: Uplink[]
  toasts: {
    key: string
    message: string
  }[]
}

export const generateUplinkId = (uplink: ReadyUplinks) =>
  hmac(uplink.settlerType, uplink.credentialId)

export default new Vuex.Store<State>({
  state: {
    ledgerEnv: null,
    route: {
      name: 'welcome'
    },
    uplinks: [],
    toasts: []
  },
  mutations: {
    SETUP_API(state, api: IlpSdk) {
      state.api = api
    },
    REFRESH_UPLINKS(state) {
      if (!state.api) {
        return
      }

      state.uplinks = state.api.state.uplinks.map(uplink => {
        const id = generateUplinkId(uplink)
        const settler = state.api!.state.settlers[uplink.settlerType]

        const existingUplink = state.uplinks.find(uplink => uplink.id === id)

        return {
          id,
          unit: settler.exchangeUnit,
          assetScale: settler.assetScale,
          balance$: uplink.balance$,
          incomingCapacity$: uplink.incomingCapacity$,
          outgoingCapacity$: uplink.outgoingCapacity$,
          totalSent$: uplink.totalSent$,
          totalReceived$: uplink.totalReceived$,
          getInternal: () => uplink,
          activeDeposit: existingUplink ? existingUplink.activeDeposit : null,
          activeWithdrawal: existingUplink
            ? existingUplink.activeWithdrawal
            : null,
          canDeposit: ['ETH', 'XRP'].includes(settler.assetCode),
          canWithdraw: ['ETH', 'XRP'].includes(settler.assetCode)
        }
      })
    },
    NAVIGATE_TO(state, route: Route) {
      // Prevent deposits and withdrawals to card already depositing
      if (route.name === 'home' && route.meta === 'deposit') {
        const uplink = state.uplinks.find(
          someUplink => someUplink.id === route.id
        )
        if (uplink && (uplink.activeDeposit || uplink.activeWithdrawal)) {
          return
        }
      }

      // Prevent deposits and withdrawals to card already withdrawing
      if (route.name === 'home' && route.meta === 'withdrawal') {
        const uplink = state.uplinks.find(
          someUplink => someUplink.id === route.id
        )
        if (uplink && (uplink.activeDeposit || uplink.activeWithdrawal)) {
          return
        }
      }

      // Prevent swaps with card withdrawing
      if (route.name === 'swap') {
        const sourceUplink = state.uplinks.find(
          someUplink => someUplink.id === route.sourceUplink
        )
        if (sourceUplink && sourceUplink.activeWithdrawal) {
          return
        }

        const destUplink = state.uplinks.find(
          someUplink => someUplink.id === route.destinationUplink
        )
        if (destUplink && destUplink.activeWithdrawal) {
          return
        }
      }

      state.route = route
    },
    SHOW_TOAST(state, message: string) {
      const key = Math.random().toString()
      state.toasts.push({
        key,
        message
      })

      setTimeout(() => {
        state.toasts = state.toasts.filter(toast => toast.key !== key)
      }, 5000)
    },
    HIDE_TOAST(state, keyToRemove: string) {
      state.toasts = state.toasts.filter(({ key }) => key !== keyToRemove)
    },
    END_DEPOSIT(state, uplinkId: string) {
      const uplink = state.uplinks.find(({ id }) => id === uplinkId)
      if (uplink) {
        uplink.activeDeposit = null
      }
    },
    END_WITHDRAWAL(state, uplinkId: string) {
      const uplink = state.uplinks.find(({ id }) => id === uplinkId)
      if (uplink) {
        uplink.activeWithdrawal = null
      }
    },
    SET_LEDGER_ENV(state, ledgerEnv: LedgerEnv) {
      state.ledgerEnv = ledgerEnv
    }
  },
  actions: {
    async loadApi({ state, commit }, ledgerEnv: LedgerEnv) {
      if (state.api) {
        if (ledgerEnv === state.ledgerEnv) {
          // If the ledgerEnv is set to the same, just go home
          return commit('NAVIGATE_TO', {
            name: 'home',
            meta: 'select-source-uplink'
          })
        }

        await state.api.disconnect()
      }

      commit('NAVIGATE_TO', {
        name: 'loading'
      })

      commit('SET_LEDGER_ENV', ledgerEnv)
      const api = await connect(ledgerEnv)

      commit('SETUP_API', Object.freeze(api!))
      commit('REFRESH_UPLINKS')

      // Since this is the initial load, if there aren't any uplinks, show welcome screen
      const noUplinks = state.uplinks.length === 0
      if (noUplinks) {
        // Show config dialog if no uplinks are configured
        commit('NAVIGATE_TO', {
          name: 'home',
          meta: 'config'
        })
      } else {
        // Otherwise, show home screen
        commit('NAVIGATE_TO', {
          name: 'home',
          meta: 'select-source-uplink'
        })
      }
    }
  },
  getters: {
    rateApi(state) {
      return state.api!.state.rateBackend
    }
  }
})
