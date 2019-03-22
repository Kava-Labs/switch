import { btc, xrp, eth } from '@kava-labs/crypto-rate-utils'
import { BehaviorSubject } from 'rxjs'
import BigNumber from 'bignumber.js'

const state = {
  uplinks: [
    {
      balance$: new BehaviorSubject(new BigNumber(3.2898287387)),
      outgoingCapacity$: new BehaviorSubject(new BigNumber(5.3)),
      incomingCapacity$: new BehaviorSubject(new BigNumber(29.45)),
      canDeposit: true,
      canWithdraw: true,
      exchangeUnit: xrp
    },
    {
      balance$: new BehaviorSubject(new BigNumber(0.01348)),
      outgoingCapacity$: new BehaviorSubject(new BigNumber(0.2398209)),
      incomingCapacity$: new BehaviorSubject(new BigNumber(0.03)),
      canDeposit: true,
      canWithdraw: true,
      exchangeUnit: eth
    },
    {
      balance$: new BehaviorSubject(new BigNumber(0.00481398)),
      outgoingCapacity$: new BehaviorSubject(new BigNumber(0.67237)),
      incomingCapacity$: new BehaviorSubject(new BigNumber(Infinity)),
      canDeposit: false,
      canWithdraw: false,
      exchangeUnit: btc
    }
  ]
}

setInterval(() => {
  state.uplinks[2].balance$.next(state.uplinks[2].balance$.value.plus(0.00128))
}, 500)

export default state
