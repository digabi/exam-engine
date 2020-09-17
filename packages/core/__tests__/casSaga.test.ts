import { expectSaga } from 'redux-saga-test-plan'
import {
  allowCas,
  allowCasCancelled,
  allowCasCountdown,
  allowCasSucceeded,
  updateCasRemaining,
} from '../src/store/cas/actions'
import { performEnableCas } from '../src/store/cas/sagas'
import { CasStatus } from '../src'

describe('performEnableCas', () => {
  describe('in the successful case', () => {
    it(`calls setCasStatus with 'allowing', performs the countdown and calls setCasStatus with 'allowed'`, async () => {
      const setCasStatus = jest.fn((casStatus: CasStatus) => Promise.resolve(casStatus))

      await expectSaga(performEnableCas, { setCasStatus } as any, allowCas(2))
        .put(allowCasCountdown(2))
        .put(updateCasRemaining(1))
        .put(allowCasSucceeded())
        .run(false)

      expect(setCasStatus).toHaveBeenCalledTimes(2)
      expect(setCasStatus).toHaveBeenNthCalledWith(1, 'allowing')
      expect(setCasStatus).toHaveBeenNthCalledWith(2, 'allowed')
    })
  })

  describe('when CAS software is already enabled', () => {
    it(`skips the countdown and calls setCasStatus with 'allowed'`, async () => {
      const setCasStatus = jest.fn(() => Promise.resolve('allowed'))

      await expectSaga(performEnableCas, { setCasStatus } as any, allowCas(2))
        .put(allowCasSucceeded())
        .run(false)

      expect(setCasStatus).toHaveBeenCalledTimes(1)
      expect(setCasStatus).toHaveBeenNthCalledWith(1, 'allowing')
    })
  })

  describe('when the user cancels the countdown', () => {
    it(`calls setCasStatus with 'forbidden' if the user cancels the countdown`, async () => {
      const setCasStatus = jest.fn((casStatus: CasStatus) => Promise.resolve(casStatus))

      await expectSaga(performEnableCas, { setCasStatus } as any, allowCas(2))
        .put(allowCasCountdown(2))
        .put(updateCasRemaining(1))
        .delay(1500)
        .dispatch(allowCasCancelled())
        .run(false)

      expect(setCasStatus).toHaveBeenCalledTimes(2)
      expect(setCasStatus).toHaveBeenNthCalledWith(1, 'allowing')
      expect(setCasStatus).toHaveBeenNthCalledWith(2, 'forbidden')
    })

    it(`doesn't cancel the countdown if CAS software has been allowed during the countdown`, async () => {
      const setCasStatus = jest
        .fn((casStatus: CasStatus) => Promise.resolve(casStatus))
        .mockImplementationOnce(() => Promise.resolve('allowing'))
        .mockImplementationOnce(() => Promise.resolve('allowed'))

      await expectSaga(performEnableCas, { setCasStatus } as any, allowCas(2))
        .put(allowCasCountdown(2))
        .put(updateCasRemaining(1))
        .put(allowCasSucceeded())
        .delay(1500)
        .dispatch(allowCasCancelled())
        .run(false)

      expect(setCasStatus).toHaveBeenCalledTimes(2)
      expect(setCasStatus).toHaveBeenNthCalledWith(1, 'allowing')
      expect(setCasStatus).toHaveBeenNthCalledWith(2, 'forbidden')
    })

    it(`cancels the process if the post-countdown setCasStatus returns 'forbidden'`, async () => {
      const setCasStatus = jest
        .fn((casStatus: CasStatus) => Promise.resolve(casStatus))
        .mockImplementationOnce(() => Promise.resolve('allowing'))
        .mockImplementationOnce(() => Promise.resolve('forbidden'))

      await expectSaga(performEnableCas, { setCasStatus } as any, allowCas(2))
        .put(allowCasCountdown(2))
        .put(updateCasRemaining(1))
        .put(allowCasCancelled())
        .run(false)

      expect(setCasStatus).toHaveBeenCalledTimes(2)
      expect(setCasStatus).toHaveBeenNthCalledWith(1, 'allowing')
      expect(setCasStatus).toHaveBeenNthCalledWith(2, 'allowed')
    })
  })
})
