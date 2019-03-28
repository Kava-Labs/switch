import { AssetUnit, eth, xrp, btc } from '@kava-labs/crypto-rate-utils'
import {
  connect,
  SettlementEngineType,
  SwitchApi,
  LedgerEnv
} from '@kava-labs/switch-api'
import BigNumber from 'bignumber.js'
import { createHmac } from 'crypto'
import { unlink } from 'fs'
import { homedir } from 'os'
import { promisify } from 'util'
import Vue from 'vue'
import Vuex from 'vuex'

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
  balance: BigNumber
  incomingCapacity: BigNumber
  outgoingCapacity: BigNumber

  // TODO Keep this, or remove it?
  canDeposit: boolean
  canWithdraw: boolean
}

export interface HomeRoute {
  name: 'home'
  selectedSourceUplink: string | null
}

export interface SwapRoute {
  name: 'swap'
  sourceUplink: string
  destinationUplink: string
}

type Route = HomeRoute | SwapRoute

export interface State {
  api?: Readonly<SwitchApi>
  uplinks: Uplink[]
  route: Route
}

export default new Vuex.Store<State>({
  state: {
    route: {
      name: 'home',
      selectedSourceUplink: null
    },
    uplinks: []
  },
  mutations: {
    SETUP_API(state, api: SwitchApi) {
      state.api = api
    },
    REFRESH_UPLINKS(state) {
      if (!state.api) {
        return
      }

      state.uplinks = state.api.state.uplinks.map(uplink => {
        const id = hmac(uplink.settlerType, uplink.credentialId)
        const settler = state.api!.state.settlers[uplink.settlerType]
        const unit = settler.exchangeUnit
        const assetScale = settler.baseUnit().unit

        return {
          id,
          unit,
          assetScale,
          balance: uplink.balance$.value,
          incomingCapacity: uplink.incomingCapacity$.value,
          outgoingCapacity: uplink.outgoingCapacity$.value,

          // TODO Should these be moved to getters or something else?
          canDeposit: ['ETH', 'XRP'].includes(unit().symbol),
          canWithdraw: ['ETH', 'XRP'].includes(unit().symbol)
        }
      })
    },
    NAVIGATE_TO(state, route: Route) {
      state.route = route
    },
    ADD_MOCK_UPLINKS(state) {
      state.uplinks = [
        {
          id: 'XRP',
          balance: new BigNumber(3.2898287387),
          outgoingCapacity: new BigNumber(5.3),
          incomingCapacity: new BigNumber(29.45),
          canDeposit: true,
          canWithdraw: true,
          unit: xrp,
          assetScale: 6
        },
        {
          id: 'ETH',
          balance: new BigNumber(0.01348),
          outgoingCapacity: new BigNumber(0.2398209),
          incomingCapacity: new BigNumber(0.03),
          canDeposit: true,
          canWithdraw: true,
          unit: eth,
          assetScale: 9
        },
        {
          id: 'BTC',
          balance: new BigNumber(0.00481398),
          outgoingCapacity: new BigNumber(0.67237),
          incomingCapacity: new BigNumber(Infinity),
          canDeposit: false,
          canWithdraw: false,
          unit: btc,
          assetScale: 8
        }
      ]
    }
  },
  actions: {
    async loadApi({ commit }) {
      commit('ADD_MOCK_UPLINKS')
    }
  },
  getters: {
    isLoaded(state) {
      return !!state.api
    }
  }
})
