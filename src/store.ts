import {
  AssetUnit,
  eth,
  xrp,
  btc,
  usd,
  convert
} from '@kava-labs/crypto-rate-utils'
import {
  connect,
  SettlementEngineType,
  SwitchApi,
  LedgerEnv,
  ReadyUplinks
} from '@kava-labs/switch-api'
import BigNumber from 'bignumber.js'
import { createHmac } from 'crypto'
import { unlink, stat } from 'fs'
import { homedir } from 'os'
import { promisify } from 'util'
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
  // TODO Add `isDepositing` with Promise that resolves/fails with the deposit?
  canDeposit: boolean
  canWithdraw: boolean
  getInternal: () => ReadyUplinks
}

/**
 * ROUTES
 */

type Route = HomeRoute | SwapRoute

export interface SwapRoute {
  name: 'swap'
  sourceUplink: string
  destinationUplink: string
  isStreaming: boolean
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

export interface State {
  api?: Readonly<SwitchApi>
  uplinks: Uplink[]
  route: Route
}

export default new Vuex.Store<State>({
  state: {
    route: {
      name: 'home',
      meta: 'select-source-uplink'
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

        return {
          id,
          unit: settler.exchangeUnit,
          assetScale: settler.assetScale,
          balance$: uplink.balance$,
          incomingCapacity$: uplink.incomingCapacity$,
          outgoingCapacity$: uplink.outgoingCapacity$,
          getInternal: () => uplink,
          canDeposit: ['ETH', 'XRP'].includes(settler.assetCode),
          canWithdraw: ['ETH', 'XRP'].includes(settler.assetCode)
        }
      })
    },
    NAVIGATE_TO(state, route: Route) {
      state.route = route
    }
  },
  actions: {
    async loadApi({ commit }) {
      /** TODO (remove in production) Delete any existing config */
      const configPath = `${homedir()}/.switch/config.json`
      await promisify(unlink)(configPath).catch(() => Promise.resolve())

      const api = await connect(LedgerEnv.Testnet)

      /** TODO (remove in production) Temp: Add BTC, ETH & XRP uplinks */

      // const ethDepositAmount = convert(usd(8), eth(), api.state.rateBackend).decimalPlaces(
      //   9
      // )
      const loadingEth = api.add({
        settlerType: SettlementEngineType.Machinomy,
        privateKey: process.env.ETH_PRIVATE_KEY_CLIENT_1!
      })
      // .then(uplink =>
      //   api.deposit({
      //     uplink,
      //     amount: ethDepositAmount
      //   })
      // )

      // const xrpDepositAmount = convert(usd(8), xrp(), api.state.rateBackend).decimalPlaces(
      //   6
      // )
      const loadingXrp = api.add({
        settlerType: SettlementEngineType.XrpPaychan,
        secret: process.env.XRP_SECRET_CLIENT_1!
      })
      // .then(uplink =>
      //   api.deposit({
      //     uplink,
      //     amount: xrpDepositAmount
      //   })
      // )

      const loadingBtc = api.add({
        settlerType: SettlementEngineType.Lnd,
        hostname: process.env.LIGHTNING_LND_HOST_CLIENT_1!,
        tlsCert: process.env.LIGHTNING_TLS_CERT_PATH_CLIENT_1!,
        macaroon: process.env.LIGHTNING_MACAROON_PATH_CLIENT_1!,
        grpcPort: parseInt(process.env.LIGHTNING_LND_GRPCPORT_CLIENT_1!, 10)
      })

      await Promise.all([loadingEth, loadingXrp, loadingBtc])

      commit('SETUP_API', Object.freeze(api!))
      commit('REFRESH_UPLINKS')
    }
  },
  getters: {
    isLoaded(state) {
      return !!state.api
    },
    rateApi(state) {
      return state.api!.state.rateBackend
    }
  }
})
