import { Locator } from '@playwright/test'
import type { MountResult } from '@playwright/experimental-ct-react'

export class AudioPlayerPage {
  readonly mountResult: MountResult
  readonly baseLocator: Locator
  public readonly playButton: Locator
  public readonly pauseButton: Locator
  public readonly progressBar: Locator
  public readonly currentTimeDisplay: Locator
  public readonly durationDisplay: Locator

  constructor(mountResult: MountResult, nth: number = 0) {
    this.mountResult = mountResult
    this.baseLocator = this.mountResult.getByTestId('audio-player-container').nth(nth)
    this.playButton = this.baseLocator.getByRole('button', { name: 'Toista äänite' })
    this.pauseButton = this.baseLocator.getByRole('button', { name: 'Keskeytä äänite' })
    this.progressBar = this.baseLocator.getByTestId('audio-player-progress-bar')
    this.currentTimeDisplay = this.baseLocator.getByTestId('audio-player-current-time')
    this.durationDisplay = this.baseLocator.getByTestId('audio-player-duration')
  }
}
