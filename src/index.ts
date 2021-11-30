import { rsaLockSendCapacity, sendCapacityToRsaLock } from './rpc'

const run = async () => {
  // await sendCapacityToRsaLock()
  await rsaLockSendCapacity()
}

run()