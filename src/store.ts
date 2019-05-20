import { AssetUnit, RateApi } from '@kava-labs/crypto-rate-utils'
import {
  connect,
  IlpSdk,
  LedgerEnv,
  ReadyUplinks,
  SettlementEngineType
} from '@kava-labs/switch-api'
import BigNumber from 'bignumber.js'
import { createHmac } from 'crypto'
import Vue from 'vue'
import Vuex from 'vuex'
import { BehaviorSubject } from 'rxjs'
import { CredentialConfigs } from '@kava-labs/switch-api/build/credential'
import { homedir } from 'os'
import { readFile, mkdir } from 'fs'
import { promisify } from 'util'
import writeFile from 'write-file-atomic'
import { decrypt, generateEncryptionKey } from 'symmetric-encrypt'
import debug from 'debug'

const log = debug('switch')

type ThenArg<T> = T extends Promise<infer U> ? U : T
type EncryptFunction = ThenArg<ReturnType<typeof generateEncryptionKey>>

Vue.use(Vuex)

const CONFIG_DIR = `${homedir()}/.switch`
const CONFIG_PATH = `${CONFIG_DIR}/config.json`

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

type Route =
  /** Home screen with all cards/uplinks */
  | {
      type: 'home'
    }
  /** Selection screen for the destination uplink in a swap */
  | {
      type: 'select-dest-uplink'
      selectedSourceUplink: string
    }
  /** Swap, specify amounts, and stream between 2 cards */
  | {
      type: 'swap'
      sourceUplink: string
      destinationUplink: string
      isStreaming: boolean
    }
  /**
   * Loading screen while deciding which flow to use
   * - Navigate here on initial load
   */
  | {
      type: 'initial-load'
    }
  /**
   * Prompt the user to enter their password to decrypt an existing config
   * - Decryption should happen here, and block advancing if it fails
   */
  | {
      type: 'prompt-password'
      password: string
      encryptedConfig: any
    }
  /** Prompt for testnet/mainnet selection if the existing config was successfully decrypted */
  | {
      type: 'select-mode'
    }
  /**
   * Show welcome screen explaining, what is Switch?
   * - After initial load, if no config, or config isn't encrypted, navigate here
   * - Choose between testnet/mainnet mode
   */
  | {
      type: 'welcome'
    }
  /**
   * Inform you what you're signing up for and require
   * the terms of service to be signed
   */
  | {
      type: 'agreement'
    }
  /**
   * If new user, prompt to set a password
   */
  | {
      type: 'set-password'
      password: string
      password2: string
    }
  /**
   * Loading spinner while connecting to ledgers
   * - Logic routing *from* this state should have knowledge
   *   of whether the previous state was setting the password,
   *   or entering a password
   */
  | {
      type: 'connecting-sdk'
    }
  /**
   * Select asset to add a new card
   * - Begin flow here if user clicks "Add Card" from home screen
   */
  | {
      type: 'select-asset'
    }
  /** Configure credentials for a new card */
  | {
      type: 'config-credential'
      config: CredentialConfigs
    }
  /** Loading spinner while creating new card */
  | {
      type: 'creating-uplink'
    }
  /**
   * Prompt to deposit funds to the card
   * - Begin flow here is user clicks "Deposit" on existing card
   */
  | {
      type: 'deposit'
      id: string // ID of the uplink deposited to
    }
  /** Prompt to approve withdrawing funds from the given uplink */
  | {
      type: 'withdraw'
      id: string // ID of the uplink to withdraw from
    }

export interface State {
  rateApi: RateApi
  ledgerEnv: LedgerEnv | null
  route: Route
  encrypt?: EncryptFunction
  config?: any
  sdk?: Readonly<IlpSdk>
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
    rateApi: {
      getPrice() {
        throw new Error('Rate API not yet loaded')
      },
      async disconnect() {
        throw new Error('Rate API not yet loaded')
      }
    },
    ledgerEnv: null,
    route: {
      type: 'initial-load'
    },
    uplinks: [],
    toasts: []
  },
  mutations: {
    SETUP_API(state, sdk: IlpSdk) {
      state.sdk = sdk
      state.rateApi = sdk.state.rateBackend
    },
    REFRESH_UPLINKS(state) {
      if (!state.sdk) {
        return
      }

      state.uplinks = state.sdk.state.uplinks.map(uplink => {
        const id = generateUplinkId(uplink)
        const settler = state.sdk!.state.settlers[uplink.settlerType]

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
      if (route.type === 'deposit') {
        const uplink = state.uplinks.find(
          someUplink => someUplink.id === route.id
        )
        if (uplink && (uplink.activeDeposit || uplink.activeWithdrawal)) {
          return
        }
      }

      // Prevent deposits and withdrawals to card already withdrawing
      if (route.type === 'withdraw') {
        const uplink = state.uplinks.find(
          someUplink => someUplink.id === route.id
        )
        if (uplink && (uplink.activeDeposit || uplink.activeWithdrawal)) {
          return
        }
      }

      // Prevent swaps with card withdrawing
      if (route.type === 'swap') {
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
    START_WITHDRAWAL(
      state,
      payload: { uplinkId: string; activeWithdrawal: Promise<any> }
    ) {
      const uplink = state.uplinks.find(({ id }) => id === payload.uplinkId)
      if (uplink) {
        uplink.activeWithdrawal = payload.activeWithdrawal
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
    },
    SET_ENCRYPTION_KEY(state, encrypt: EncryptFunction) {
      state.encrypt = encrypt
    },
    CACHE_CONFIG(state, config: any) {
      state.config = config
    }
  },
  actions: {
    dismissDialog({ state, commit }) {
      const prohibitedRoutes = [
        'initial-load',
        'prompt-password',
        'select-mode',
        'welcome',
        'agreement',
        'set-password',
        'connecting-sdk',
        'creating-uplink'
      ]

      if (prohibitedRoutes.includes(state.route.type)) {
        return
      }

      commit('NAVIGATE_TO', {
        type: 'home'
      })
    },

    async initialLoad({ state, commit, dispatch }) {
      if (state.route.type !== 'initial-load') {
        return
      }

      log('Checking for config file')

      await promisify(readFile)(CONFIG_PATH)
        .then(data => JSON.parse(data.toString()))
        .then(data => {
          if (data.ciphertext) {
            log('Loaded encrypted file; prompting for password')

            // Prompt for password to attempt decryption
            commit('NAVIGATE_TO', {
              type: 'prompt-password',
              password: '',
              encryptedConfig: data
            })
          } else {
            log(
              'Loaded unencrypted file; navigating to onboard flow to set password'
            )

            // Navigate to onboarding flow to set password *with* existing config
            commit('CACHE_CONFIG', data)
            commit('NAVIGATE_TO', {
              type: 'welcome'
            })
          }
        })
        .catch(err => {
          log('Error loading config file; navigating to onboarding flow:', err)

          // Navigate to onboarding flow *without* existing config
          commit('NAVIGATE_TO', {
            type: 'welcome'
          })
        })
        .finally(() => {
          log('Starting persistence daemon to write config every 30 seconds')
          setInterval(() => dispatch('persistConfig'), 30000)
        })
    },

    async enterPassword({ state, commit }) {
      // TODO Should this logic also be checked before the navigation occurs?
      if (state.route.type !== 'prompt-password') {
        return
      }

      log('Attempting to decrypt config file with password')

      // Attempt to decrypt the existing config file
      try {
        // TODO Move these high compute tasks to another thread so they don't block UI
        const decryptedConfig = await decrypt(
          state.route.password,
          state.route.encryptedConfig
        )

        commit('CACHE_CONFIG', JSON.parse(decryptedConfig))

        const encrypt = await generateEncryptionKey(state.route.password)
        commit('SET_ENCRYPTION_KEY', encrypt)

        log('Successfully decrypted config; navigating to mode selection')
        commit('NAVIGATE_TO', {
          type: 'select-mode'
        })
      } catch (err) {
        log('Failed to decrypt config file:', err)
        commit('SHOW_TOAST', 'Invalid password')
      }
    },

    async setPassword({ state, commit }) {
      if (state.route.type !== 'set-password') {
        return
      }

      const { password, password2 } = state.route
      if (password.length === 0) {
        return
      }

      if (password !== password2) {
        commit('SHOW_TOAST', 'Passwords do not match')
        return
      }

      log('Generating encryption key from new password')

      // TODO Does this need to happen before the navigation? (But, if it failed, could be bad since persistence wouldn't work)
      const encrypt = await generateEncryptionKey(state.route.password)
      commit('SET_ENCRYPTION_KEY', encrypt)

      log('Navigating to mode selection')

      commit('NAVIGATE_TO', {
        type: 'select-mode'
      })
    },

    setMode({ state, commit, dispatch }, ledgerEnv: LedgerEnv) {
      if (state.route.type !== 'select-mode') {
        return
      }

      commit('SET_LEDGER_ENV', ledgerEnv)
      log(`Selected ${ledgerEnv} mode; connecting and loading SDK`)

      dispatch('loadSdk')
    },

    async persistConfig({ state, commit }) {
      if (!state.encrypt || !state.sdk) {
        return
      }

      const config = state.sdk.serializeConfig()
      commit('CACHE_CONFIG', config)

      const serializedConfig = JSON.stringify(config)
      const encryptedConfig = await state.encrypt(serializedConfig)

      await promisify(mkdir)(CONFIG_DIR).catch(err => {
        if (err.code === 'EEXIST') return
        else {
          log('Error creating ~/.switch directory:', err)
        }
      })

      await promisify(writeFile)(
        CONFIG_PATH,
        JSON.stringify(encryptedConfig)
      ).catch(err => log('Error writing config file:', err))

      log(`Persisted config file to ${CONFIG_PATH}`)
    },

    async loadSdk({ state, commit, dispatch }) {
      commit('NAVIGATE_TO', {
        type: 'connecting-sdk'
      })

      let sdk: IlpSdk
      try {
        sdk = await connect(
          state.ledgerEnv!,
          state.config
        )
      } catch (err) {
        log('Failed to connect SDK:', err)
        commit('SHOW_TOAST', 'Failed to connect')
        commit('NAVIGATE_TO', {
          type: 'select-mode'
        })
        return
      }

      log('Connected SDK. Reloading uplinks and proceeding with flow')

      commit('SETUP_API', Object.freeze(sdk!))
      commit('REFRESH_UPLINKS')

      commit('NAVIGATE_TO', {
        type: state.uplinks.length > 0 ? 'home' : 'select-asset'
      })
    },

    async agreeToTerms({ state, commit }) {
      if (state.route.type !== 'agreement') {
        return
      }

      log('Signed Terms of Serivce. Prompting to set a new password')

      commit('NAVIGATE_TO', {
        type: 'set-password',
        password: '',
        password2: ''
      })
    },

    selectBtc({ state, commit }) {
      if (state.route.type !== 'select-asset') {
        return
      }

      commit('NAVIGATE_TO', {
        type: 'config-credential',
        config: {
          settlerType: SettlementEngineType.Lnd,
          hostname: '',
          grpcPort: '',
          tlsCert: '',
          macaroon: ''
        }
      })
    },

    selectEth({ state, commit }) {
      if (state.route.type !== 'select-asset') {
        return
      }

      commit('NAVIGATE_TO', {
        type: 'config-credential',
        config: {
          settlerType: SettlementEngineType.Machinomy,
          privateKey: ''
        }
      })
    },

    selectXrp({ state, commit }) {
      if (state.route.type !== 'select-asset') {
        return
      }

      commit('NAVIGATE_TO', {
        type: 'config-credential',
        config: {
          settlerType: SettlementEngineType.XrpPaychan,
          secret: ''
        }
      })
    },

    backToSelectAsset({ commit, state }) {
      if (state.route.type !== 'config-credential') {
        return
      }

      commit('NAVIGATE_TO', {
        type: 'select-asset'
      })
    },

    async addCard({ state, commit }) {
      const config =
        state.route.type === 'config-credential' ? state.route.config : null
      if (!config || !state.sdk) {
        return
      }

      log('Attempting to add a new card with configured credential')
      commit('NAVIGATE_TO', {
        type: 'creating-uplink'
      })

      try {
        const uplink = await state.sdk.add(config)
        commit('REFRESH_UPLINKS')

        const uplinkId = generateUplinkId(uplink)
        const generatedUplink = state.uplinks.find(({ id }) => id === uplinkId)
        if (!generatedUplink) {
          throw new Error('Uplink not found in state after adding uplink')
        }

        log('Successfully added new card; navigating to deposit, if supported')
        commit('SHOW_TOAST', 'Added new card')

        // Automatically open deposit dialog after adding uplink
        // Don't show deposit screen if a Lightning uplink was created
        commit(
          'NAVIGATE_TO',
          generatedUplink.canDeposit
            ? {
                type: 'deposit',
                id: generateUplinkId(uplink)
              }
            : {
                type: 'home'
              }
        )
      } catch (err) {
        log('Failed to configure new card:', err)
        commit('SHOW_TOAST', 'Failed to configure new card')
        commit('NAVIGATE_TO', {
          type: 'select-asset'
        })
      }
    },

    withdraw({ state, commit }, uplink: Uplink) {
      if (!state.sdk) {
        return
      }

      const activeWithdrawal = state.sdk
        .withdraw({ uplink: uplink.getInternal() })
        .then(async () => {
          if (!state.sdk) {
            return log('Unexpected state: SDK unavailable during withdrawal')
          }

          await state.sdk.remove(uplink.getInternal())

          log('Withdrawal and uplink removal succeeded')
          commit('SHOW_TOAST', 'Successfully withdrew funds')
        })
        .catch(err => {
          log('Withdraw failed:', err)
          commit('SHOW_TOAST', 'Failed to withdraw funds')
        })
        .finally(() => {
          commit('END_WITHDRAWAL', uplink.id)
          commit('REFRESH_UPLINKS')
        })

      commit('START_WITHDRAWAL', {
        uplinkId: uplink.id,
        activeWithdrawal
      })
      commit('NAVIGATE_TO', {
        type: 'home'
      })
    }
  },
  getters: {
    isMainnet(state) {
      return state.ledgerEnv === LedgerEnv.Mainnet
    }
  }
})
