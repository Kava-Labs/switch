import { AssetUnit } from '@kava-labs/crypto-rate-utils'
import {
  connect,
  SwitchApi,
  LedgerEnv,
  ReadyUplinks
} from '@kava-labs/switch-api'
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
  activeDeposit: null | Promise<void>
  activeWithdrawal: null | Promise<void>
  canDeposit: boolean
  canWithdraw: boolean
  getInternal: () => ReadyUplinks
}

/**
 * ROUTES
 */

type Route = HomeRoute | SwapRoute | LoadingSpinner

export interface SwapRoute {
  name: 'swap'
  sourceUplink: string
  destinationUplink: string
  isStreaming: boolean
}

export interface LoadingSpinner {
  name: 'loading'
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
  showWelcome: boolean
  route: Route
  api?: Readonly<SwitchApi>
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
    showWelcome: false,
    route: {
      name: 'loading'
    },
    uplinks: [],
    toasts: []
  },
  mutations: {
    SETUP_API(state, api: SwitchApi) {
      state.api = api
    },
    REFRESH_UPLINKS(state, initialLoad = false) {
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
          getInternal: () => uplink,
          activeDeposit: existingUplink ? existingUplink.activeDeposit : null,
          activeWithdrawal: existingUplink
            ? existingUplink.activeWithdrawal
            : null,
          canDeposit: ['ETH', 'XRP'].includes(settler.assetCode),
          canWithdraw: ['ETH', 'XRP'].includes(settler.assetCode)
        }
      })

      const noUplinks = state.uplinks.length === 0

      // If initial load, show welcome; otherwise, hide it
      state.showWelcome = noUplinks && initialLoad

      // Show config dialog if no uplinks are configured
      state.route = noUplinks
        ? {
            name: 'home',
            meta: 'config'
          }
        : (state.route = {
            name: 'home',
            meta: 'select-source-uplink'
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
    }
  },
  actions: {
    async loadApi({ commit }) {
      const api = await connect(LedgerEnv.Testnet)

      commit('SETUP_API', Object.freeze(api!))
      commit('REFRESH_UPLINKS', true)
    }
  },
  getters: {
    rateApi(state) {
      return state.api!.state.rateBackend
    }
  }
})
