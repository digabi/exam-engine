import classNames from 'classnames'
import React from 'react'

const borderedPaddingAndBorderPx = 18

interface ResponsiveMediaContainerProps {
  bordered?: boolean
  className?: string
  children: React.ReactElement<any>
  height: number
  width: number
  caption?: React.ReactNode[]
  captionId?: string
  onMaxWidthCalculated?: (maxWidth: number) => void
}

/**
 * Wraps children into responsive container, which is used to prevent reflows as external media like images or videos
 * finish loading, see https://www.perpetual-beta.org/weblog/responsive-images-without-browser-reflow.html for more
 * information.
 */
const ResponsiveMediaContainer: React.FunctionComponent<ResponsiveMediaContainerProps> = ({
  bordered = false,
  className,
  children,
  height,
  width,
  caption,
  captionId,
  onMaxWidthCalculated
}) => {
  const paddingBottom = `${(height / width) * 100}%`
  const maxWidth = width + (bordered ? borderedPaddingAndBorderPx : 0)

  React.useEffect(() => {
    if (onMaxWidthCalculated) {
      onMaxWidthCalculated(maxWidth)
    }
  }, [maxWidth, onMaxWidthCalculated])

  return (
    <span
      className={classNames(
        'responsive-media-container',
        { 'responsive-media-container--bordered': bordered },
        className
      )}
      style={{
        maxWidth
      }}
    >
      <span
        className="responsive-media-container__inner"
        style={{
          paddingBottom
        }}
      >
        {children}
      </span>
      {caption && (
        <span className="e-block e-mrg-t-1 e-font-size-s e-light" id={captionId}>
          {caption}
        </span>
      )}
    </span>
  )
}

export default ResponsiveMediaContainer
